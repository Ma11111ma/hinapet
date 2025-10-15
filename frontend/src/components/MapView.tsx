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

//===GoogleMapsGeocoding API===
const geocodeCurrentPosition = async (lat: number, lng: number) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.results && data.results[0]) {
    return data.results[0].formatted_address;
  }
  return "不明な位置";
};

const containerStyle = { width: "100%", height: "600px" };
const center = { lat: 35.3386, lng: 139.4916 }; // 藤沢駅付近（モック中心）

export default function MapView() {
  const { shelters, fetchShelters, loading, error } = useShelters();
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
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert("このブラウザは位置情報取得に対応していません。");
      const fallback = { lat: 35.3419, lng: 139.4916 };
      setCurrentPosition(fallback);
      setCurrentPlaceName("藤沢市役所");
      return;
    }

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
        alert(`現在地を取得しました:${place}`);
      },
      async () => {
        setGeoError(
          "位置情報を取得できませんでした。藤沢市役所を現在地にします"
        );
        alert("位置情報を取得できませんでした。藤沢市役所を現在地にします。");
        const fallback = { lat: 35.3419, lng: 139.4916 };
        setCurrentPosition(fallback);
        setCurrentPlaceName("藤沢市役所");
      }
    );
  };

  const calculateRoute = (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const leg = result.routes[0].legs[0];
          console.log("距離:", leg.distance?.text, "時間:", leg.duration?.text);
          setDirections(result);
          setDistance(leg.distance?.text || null);
          setDuration(leg.duration?.text || null);
        } else {
          console.error("Directions リクエストに失敗しました:", status);
        }
      }
    );
  };
  //==初回ロード・避難所データ取得==
  useEffect(() => {
    fetchShelters({});
  }, [fetchShelters]);

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

  const handleSearch = (kw: string) => {
    setKeyword(kw);
  };

  const handleTypeSelect = (t: ShelterType | null) => {
    setSelectedType(selectedType === t ? null : t); // 再押下で解除
  };
  const handleClearAll = () => {
    setKeyword("");
    setSelectedType(null);
  };

  // 避難タイプに応じた色設定
  const getMarkerColor = (type: ShelterType) => {
    switch (type) {
      case "accompany":
        return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // 同行
      case "companion":
        return "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // 同伴
      default:
        return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // 不明
    }
  };

  return (
    <div className="relative">
      {geoError && (
        <div className="absolute top-24 left-4 bg-red-100 text-red-700 p-2 rounded shadow">
          {geoError}
        </div>
      )}
      {!apiKey ? (
        <p>Maps APIキーが設定されていません（frontend/.env.local）。</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {/* 🔍 検索UI*/}
          <div className="absolute top-4 left-4 z-10 space-y-2 bg-white p-3 rounded shadow">
            <button
              onClick={getCurrentPosition}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              現在地を取得
            </button>
            <SearchBar onSearch={handleSearch} onClear={handleClearAll} />
            <ShelterTypeFilter
              selected={selectedType}
              onSelect={handleTypeSelect}
            />
          </div>

          {/* 読み込み中・エラー表示 */}
          {loading && (
            <div className="absolute top-20 left-4 bg-white p-2 rounded shadow">
              読み込み中...
            </div>
          )}
          {error && (
            <div className="absolute top-20 left-4 bg-red-100 p-2 rounded shadow text-red-700">
              {error}
            </div>
          )}

          {/* GoogleMap */}
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
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

              {/*現在地のInfoウィンドウ*/}
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

              {filteredShelters.map((shelter) => (
                <Marker
                  key={shelter.id}
                  position={{ lat: shelter.lat, lng: shelter.lng }}
                  title={shelter.name}
                  icon={getMarkerColor(shelter.type)}
                  onClick={() => {
                    setSelectedShelter(shelter);
                    if (!currentPosition) {
                      alert("まず現在地を取得してください");
                      return;
                    }
                    setDirections(null);

                    calculateRoute(currentPosition, {
                      lat: shelter.lat,
                      lng: shelter.lng,
                    });
                    setSelectedShelter(shelter);
                  }}
                />
              ))}

              {directions && <DirectionsRenderer directions={directions} />}

              <MapLegend />
              {/*==モーダル==*/}
              {selectedShelter && (
                <ShelterModal
                  shelter={selectedShelter}
                  onClose={() => setSelectedShelter(null)}
                  onRoute={(dest) => {
                    if (!currentPosition) {
                      alert("現在地を取得してください");
                      return;
                    }
                    calculateRoute(currentPosition, dest);
                  }}
                  distance={distance}
                  duration={duration}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </>
      )}
      ;
    </div>
  );
}
