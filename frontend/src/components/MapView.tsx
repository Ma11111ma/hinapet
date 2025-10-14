"use client";
import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useShelters, Shelter } from "../hooks/useShelters";
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
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetchShelters();
  }, []);

  // 避難タイプに応じた色設定
  const getMarkerColor = (type: string) => {
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
          <div className="absolute top-4 left-4 z-10">
            <SearchBar onSearch={setKeyword} />
            <ShelterTypeFilter
              selected={selectedType}
              onSelect={setSelectedType}
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
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
            >
              {shelters.map((shelter: Shelter) => (
                <Marker
                  key={shelter.id}
                  position={{ lat: shelter.lat, lng: shelter.lng }}
                  title={shelter.name}
                  icon={getMarkerColor(shelter.type)}
                  onClick={() => setSelectedShelter(shelter)}
                />
              ))}
              <MapLegend />
              {/*==モーダル==*/}
              {selectedShelter && (
                <ShelterModal
                  shelter={selectedShelter}
                  onClose={() => setSelectedShelter(null)}
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
