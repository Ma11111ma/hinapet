"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import ShelterDetailPanel from "./ShelterDetailPanel";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useShelters } from "../hooks/useShelters";
import type { Shelter, ShelterType } from "../types/shelter";
import MapLegend from "./MapLegend";
import { useDistanceMatrix } from "@/hooks/useDistanceMatrix";
import { LoadingSpinner } from "./LoadingSpinner";
import { getShelterPinSymbol } from "./ShelterPin";
import SearchBar from "./SearchBar";
import ShelterTypeFilter from "./ShelterTypeFilter";
import SplashScreen from "../components/SplashScreen";
import TutorialOverlay from "../components/TutorialOverlay";

//===GoogleMapsGeocoding API===
const geocodeCurrentPosition = async (lat: number, lng: number) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // http://localhost:8000
  const url = `${apiUrl}/geocode?address=${lat},${lng}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Geocoding API error:", res.statusText);
      return "位置情報を取得できません";
    }

    const data = await res.json();

    // FastAPI 側が Google API のレスポンスをそのまま返す場合
    if (data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }

    // 独自形式で返している場合（Aチームが {"address": "..."} と返すケース）
    if (data.address) {
      return data.address;
    }

    return "不明な位置";
  } catch (error) {
    console.error("Error fetching geocode:", error);
    return "位置情報エラー";
  }
};

const containerStyle = {
  width: "100vw",
  height: "100vh",
};
//=初期現在地=
const DEFAULT_LOCATION = { lat: 35.3386, lng: 139.4916 }; // 藤沢市役所
const DEFAULT_LOCATION_LABEL = "藤沢市役所";

export default function MapView() {
  const { shelters, fetchShelters, error } = useShelters();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  //==状態管理===
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState<ShelterType | null>(null);
  const [showCurrentInfo, setShowCurrentInfo] = useState(false);
  const [currentPlaceName, setCurrentPlaceName] = useState<string>("");
  const [currentPosition, setCurrentPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  // const [distance, setDistance] = useState<string | null>(null);
  // const [duration, setDuration] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const {
    distances,
    durations,
    calculate,
    loading: distLoading,
  } = useDistanceMatrix();

  const [isLocating, setIsLocating] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<"accompany" | "companion">(
    "accompany"
  );
  const [buttonPositions, setButtonPositions] = useState<{
    accompany?: DOMRect;
    companion?: DOMRect;
  }>({});

  const handleLayout = (type: ShelterType, rect: DOMRect) => {
    setButtonPositions((prev) => ({ ...prev, [type]: rect }));
  };

  const getCurrentPosition = async () => {
    if (!navigator.geolocation) {
      setGeoError("このブラウザは位置情報取得に対応していません。");
      setCurrentPosition(DEFAULT_LOCATION);
      setCurrentPlaceName(DEFAULT_LOCATION_LABEL);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentPosition(coords);

        //GoogleMapsから住所・施設名を取得
        const place = await geocodeCurrentPosition(coords.lat, coords.lng);
        setCurrentPlaceName(place);
        setGeoError(null);
        setIsLocating(false);
      },
      () => {
        setGeoError(
          "位置情報を取得できませんでした。藤沢市役所を現在地にします"
        );
        setCurrentPosition(DEFAULT_LOCATION);
        setCurrentPlaceName(DEFAULT_LOCATION_LABEL);
        setIsLocating(false);
      }
    );
  };

  //==初回ロード時に自動で現在地と避難所取得==
  useEffect(() => {
    fetchShelters({});
    getCurrentPosition();
  }, [fetchShelters]);

  //==現在地と避難所リストが揃ったら距離を計計算
  useEffect(() => {
    if (currentPosition && shelters.length > 0) {
      calculate(currentPosition, shelters);
    }
  }, [currentPosition, shelters, calculate]);

  useEffect(() => {
    if (!showTutorial) return;

    // ボタンを className で安全に特定
    const accompanyBtn = document.querySelector(".filter-btn-accompany");
    const companionBtn = document.querySelector(".filter-btn-companion");

    if (
      accompanyBtn instanceof HTMLElement &&
      companionBtn instanceof HTMLElement
    ) {
      setButtonPositions({
        accompany: accompanyBtn.getBoundingClientRect(),
        companion: companionBtn.getBoundingClientRect(),
      });
    }
  }, [showTutorial]);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    // shelter名または住所に部分一致するものを探す
    const hit = shelters.find(
      (s) => s.name.includes(kw) || s.address.includes(kw)
    );

    // ヒットしたらその位置にフォーカス
    if (hit && mapRef.current) {
      mapRef.current.panTo({ lat: hit.lat, lng: hit.lng });
      mapRef.current.setZoom(15);
      setSelectedShelter(hit);
    } else if (typeof google !== "undefined" && google.maps) {
      // 近辺の地名検索
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: `藤沢市 ${kw}` }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const newCenter = { lat: loc.lat(), lng: loc.lng() };
          mapRef.current?.panTo(newCenter);
          mapRef.current?.setZoom(14);
        } else {
          console.warn("該当する場所が見つかりません:", status);
        }
      });
    }
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedType(null);
  };
  const handleTypeSelect = (t: ShelterType | null) => {
    if (!t) {
      setSelectedType(null);
    } else {
      setSelectedType(selectedType === t ? null : t);
    }
  };

  //絞り込み・ソート
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const matchKeyword =
        !keyword ||
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.address.toLowerCase().includes(keyword.toLowerCase());

      // 🔍 種別マッチ（同伴＝秋葉台文化体育館／同行＝それ以外）
      let matchType = true;
      if (selectedType === "companion") {
        matchType = s.name.includes("秋葉台文化体育館");
      } else if (selectedType === "accompany") {
        matchType = !s.name.includes("秋葉台文化体育館");
      }
      return matchKeyword && matchType;
    });
  }, [shelters, keyword, selectedType]);

  // 混雑度によるソート（空きあり → 満員）
  const sortedShelters = useMemo(() => {
    const order = { empty: 1, few: 2, full: 3 };
    return [...filteredShelters].sort(
      (a, b) => order[a.crowd_level ?? "full"] - order[b.crowd_level ?? "full"]
    );
  }, [filteredShelters]);

  const calculateRoute = (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    if (typeof google === "undefined" || !google.maps) {
      console.warn("Google Maps SDK not loaded yet");
      return;
    }

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Directions リクエストに失敗しました:", status);
        }
      }
    );
  };

  //==ルート描画==

  return (
    <>
      {showSplash ? (
        // 起動画面（ふわっと表示 → 終了でチュートリアル開始）
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            setShowTutorial(true);
          }}
        />
      ) : (
        <div className="relative w-full h-full overflow-hidden">
          {(isLocating || distLoading) && <LoadingSpinner />}
          {geoError && (
            <div className="absolute top-24 left-4 bg-red-100 text-red-700 p-2 rounded shadow">
              {geoError}
            </div>
          )}
          {/* 🔍 検索・フィルターUI */}
          <div className="fixed top-[72px] left-0 w-full z-50 flex flex-col items-center pointer-events-none space-y-2">
            <div className="pointer-events-auto">
              <SearchBar onSearch={handleSearch} onClear={handleClear} />
            </div>
            <div className="pointer-events-auto">
              <ShelterTypeFilter
                selected={selectedType}
                onSelect={handleTypeSelect}
                onLayout={handleLayout}
                highlightTarget={
                  showTutorial
                    ? tutorialStep === "accompany"
                      ? "accompany"
                      : "companion"
                    : null
                }
              />
            </div>
          </div>

          {!apiKey ? (
            <p>Maps APIキーが設定されていません（frontend/.env.local）。</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div className="absolute inset-0 z-0">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition || DEFAULT_LOCATION}
                zoom={13}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                options={{
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  zoomControl: true,
                  gestureHandling: "cooperative",
                  disableDefaultUI: false,
                  clickableIcons: false,
                  draggable: true,
                }}
              >
                {/* 現在地ピン */}
                {currentPosition && (
                  <Marker
                    position={currentPosition}
                    icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    onClick={() => setShowCurrentInfo(!showCurrentInfo)}
                  />
                )}

                {/* 現在地の吹き出し */}
                {showCurrentInfo && currentPosition && (
                  <InfoWindow
                    position={currentPosition}
                    onCloseClick={() => setShowCurrentInfo(false)}
                  >
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">現在地</p>
                      <p className="text-gray-600">
                        {currentPlaceName || "取得中..."}
                      </p>
                    </div>
                  </InfoWindow>
                )}

                {/* 避難所ピン */}
                {sortedShelters.map((shelter) => {
                  const symbol = getShelterPinSymbol(shelter.type);
                  if (!symbol) return null;

                  return (
                    <Marker
                      key={shelter.id}
                      position={{ lat: shelter.lat, lng: shelter.lng }}
                      title={shelter.name}
                      icon={symbol}
                      onClick={() => {
                        setSelectedShelter(shelter);
                        if (currentPosition) {
                          calculateRoute(currentPosition, {
                            lat: shelter.lat,
                            lng: shelter.lng,
                          });
                        }
                      }}
                    />
                  );
                })}

                {/* 経路描画 */}
                {directions && <DirectionsRenderer directions={directions} />}
                {showTutorial && (
                  <div className="absolute inset-0 z-[999] pointer-events-none">
                    <TutorialOverlay
                      onFinish={() => setShowTutorial(false)}
                      positions={buttonPositions}
                    />
                  </div>
                )}

                {/* 凡例 */}
                <MapLegend />

                {/* 地図タイプ切替ボタン */}
                <div className="absolute bottom-[120px] left-4 z-30">
                  <div className="flex bg-white rounded-full shadow-md overflow-hidden border border-gray-200">
                    <button
                      onClick={() => mapRef.current?.setMapTypeId("roadmap")}
                      className="px-4 py-1 text-sm hover:bg-gray-100 border-r"
                    >
                      地図
                    </button>
                    <button
                      onClick={() => mapRef.current?.setMapTypeId("hybrid")}
                      className="px-4 py-1 text-sm hover:bg-gray-100"
                    >
                      航空写真
                    </button>
                  </div>
                </div>

                {/* ✅ モバイル：ボトムシート ／ PC：右サイドパネル */}
                {selectedShelter && (
                  <ShelterDetailPanel
                    shelter={selectedShelter}
                    onClose={() => setSelectedShelter(null)}
                    distance={
                      distances[String(selectedShelter.id)]?.text ?? "-"
                    }
                    duration={
                      durations[String(selectedShelter.id)]?.text ?? "-"
                    }
                  />
                )}
              </GoogleMap>
            </div>
          )}
        </div>
      )}
    </>
  );
}
