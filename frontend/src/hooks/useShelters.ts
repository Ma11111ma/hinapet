//frontend/src/hooks/useShelters.ts
import { useState } from "react";

export type Shelter = {
  id: string;
  name: string;
  address: string;
  type: "accompany" | "companion";
  capacity: string;
  lat: number;
  lng: number;
};

type FetchParams = {
  keyword?: string;
  category?: string;
};

export const useShelters = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShelters = async ({ keyword, category }: FetchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (category) params.append("category", category);

      console.log("📡 Fetching shelters:", `${base}/shelters?${params}`);

      const res = await fetch(`${base}/shelters`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      console.log("shelters/APIレスポンスOK", data);

      if (Array.isArray(data.items)) {
        setShelters(data.items);
      } else if (Array.isArray(data)) {
        setShelters(data);
      }
    } catch (err) {
      console.error("❌ shelters fetch error:", err);
      setError("避難所データを取得できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return { shelters, error, loading, fetchShelters };
};
