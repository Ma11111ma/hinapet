"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useShelters } from "../hooks/useShelters";
import type { Shelter, ShelterType } from "../types/shelter";
import MapLegend from "./MapLegend";
import ShelterModal from "./ShelterModal";
import SearchBar from "./SearchBar";
import ShelterTypeFilter from "./ShelterTypeFilter";
import { useDistanceMatrix } from "@/hooks/useDistanceMatrix";
import { LoadingSpinner } from "./LoadingSpinner";
import { getShelterPinSymbol } from "./ShelterPin";

//===GoogleMapsGeocoding API===
const geocodeCurrentPosition = async (lat: number, lng: number) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000
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

const containerStyle = { width: "100%", height: "600px" };
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

  const handleTypeSelect = (t: ShelterType | null) => {
    setSelectedType(selectedType === t ? null : t);
  };

  // ✅ 検索条件のクリア
  const handleClearAll = () => {
    setKeyword("");
    setSelectedType(null);
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

  //絞り込み・ソート
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const matchKeyword =
        !keyword ||
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.address.toLowerCase().includes(keyword.toLowerCase());
      const matchType = !selectedType || s.type === selectedType;
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

  // // ==ピンの色設定==
  // const getMarkerColor = (type: ShelterType) => {
  //   switch (type) {
  //     case "accompany":
  //       return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // 同行
  //     case "companion":
  //       return "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // 同伴
  //     default:
  //       return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // 不明
  //   }
  // };

  //==ルート描画==
  return (
    <div className="relative">
      {(isLocating || distLoading) && <LoadingSpinner />}
      {geoError && (
        <div className="absolute top-24 left-4 bg-red-100 text-red-700 p-2 rounded shadow">
          {geoError}
        </div>
      )}
      {/* 🔍 検索・フィルターUI*/}
      <div className="absolute top-4 left-4 z-10 space-y-2 bg-white p-3 rounded shadow">
        <button
          onClick={getCurrentPosition}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          現在地を再取得
        </button>
        <SearchBar onSearch={setKeyword} onClear={handleClearAll} />
        <ShelterTypeFilter
          selected={selectedType}
          onSelect={handleTypeSelect}
        />
      </div>
      {!apiKey ? (
        <p>Maps APIキーが設定されていません（frontend/.env.local）。</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition || DEFAULT_LOCATION}
            zoom={13}
            onLoad={(map) => {
              mapRef.current = map;
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

            {/*現在地情報ウィンドウ*/}
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

            {/*避難所ピン*/}
            {sortedShelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={{ lat: shelter.lat, lng: shelter.lng }}
                title={shelter.name}
                icon={getShelterPinSymbol(shelter.type)}
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
            ))}

            {directions && <DirectionsRenderer directions={directions} />}
            <MapLegend />
          </GoogleMap>
        </LoadScript>
      )}

      {/*==モーダル==*/}
      {selectedShelter && (
        <ShelterModal
          shelter={selectedShelter}
          onClose={() => setSelectedShelter(null)}
          onRoute={(dest) => {
            if (currentPosition) calculateRoute(currentPosition, dest);
          }}
          distance={distances[String(selectedShelter.id)]?.text ?? "-"}
          duration={durations[String(selectedShelter.id)]?.text ?? "-"}
        />
      )}
    </div>
  );
}
