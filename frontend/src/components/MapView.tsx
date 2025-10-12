"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useShelters } from "../hooks/useShelters";

const containerStyle = { width: "100%", height: "600px" };
const center = { lat: 35.3386, lng: 139.4916 }; // 藤沢駅付近（モック中心）

export default function MapView() {
  const { shelters, error } = useShelters();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey)
    return (
      <p>Maps APIキーが設定されていません（frontend/.env.local を確認）。</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
        {shelters.map((s) => (
          <Marker
            key={s.id}
            position={{ lat: s.lat, lng: s.lng }}
            title={s.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
