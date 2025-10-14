"use client";
import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useShelters, Shelter } from "../hooks/useShelters";
import MapLegend from "./MapLegend";
import ShelterModal from "./ShelterModal";

const containerStyle = { width: "100%", height: "600px" };
const center = { lat: 35.3386, lng: 139.4916 }; // 藤沢駅付近（モック中心）

export default function MapView() {
  const { shelters, error } = useShelters();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  if (!apiKey)
    return (
      <p>Maps APIキーが設定されていません（frontend/.env.local を確認）。</p>
    );
  if (error) return <p>{error}</p>;

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
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {Array.isArray(shelters) &&
          shelters.map((shelter: Shelter) => (
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
  );
}
