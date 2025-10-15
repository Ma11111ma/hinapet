"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useShelters } from "../hooks/useShelters";
import type { Shelter, ShelterType } from "../types/shelter";
import MapLegend from "./MapLegend";
import ShelterModal from "./ShelterModal";
import SearchBar from "./SearchBar";
import ShelterTypeFilter from "./ShelterTypeFilter";

const containerStyle = { width: "100%", height: "600px" };
const center = { lat: 35.3386, lng: 139.4916 }; // 藤沢駅付近（モック中心）

export default function MapView() {
  const { shelters, fetchShelters, loading, error } = useShelters();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState<ShelterType | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert("このブラウザは位置情報取得に対応していません。");
      const fallback = { lat: 35.3419, lng: 139.4916 };
      setCurrentPosition(fallback);

      // ✅ mapRef.current が null でない時だけ安全に呼び出す
      if (mapRef.current) {
        mapRef.current.panTo(fallback);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentPosition(coords);
        // 安全チェックを追加
        if (mapRef.current) {
          mapRef.current.panTo(coords);
        }
        alert("現在地を取得しました");
      },
      (err) => {
        console.warn("位置情報取得エラー:", err.message);
        alert(
          "位置情報を取得できませんでした(初期値として藤沢市役所を使用します)"
        );
        const fallback = { lat: 35.3419, lng: 139.4916 };
        setCurrentPosition(fallback);
        if (mapRef.current) {
          mapRef.current.panTo(fallback);
        }
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

  // クリア → 全件
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
      {!apiKey ? (
        <p>Maps APIキーが設定されていません（frontend/.env.local）。</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {/* 🔍 検索UI*/}
          {distance && duration && (
            <div className="absolute top-32 left-4 bg-white px-4 py-2 rounded shadow z-10 text-sm">
              <p>距離：{distance}</p>
              <p>所要時間：約 {duration}</p>
            </div>
          )}
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
              {/* 現在地ピンを表示 */}
              {currentPosition && (
                <Marker
                  position={currentPosition}
                  icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  title="現在地（藤沢市役所またはGPS取得位置）"
                />
              )}
              {filteredShelters.map((shelter) => (
                <Marker
                  key={shelter.id}
                  position={{ lat: shelter.lat, lng: shelter.lng }}
                  title={shelter.name}
                  icon={getMarkerColor(shelter.type)}
                  onClick={() => {
                    if (!currentPosition) {
                      alert("まず現在地を取得してください");
                      return;
                    }
                    calculateRoute(currentPosition, {
                      lat: shelter.lat,
                      lng: shelter.lng,
                    });
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
                    setSelectedShelter(null);
                  }}
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
