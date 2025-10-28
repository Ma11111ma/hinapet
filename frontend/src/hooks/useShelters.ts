//frontend/src/hooks/useShelters.ts
import { useState, useCallback } from "react";
import type { Shelter, ShelterType } from "../types/shelter";

type FetchParams = {
  keyword?: string;
  category?: ShelterType;
};

export const useShelters = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShelters = useCallback(
    async ({ keyword, category }: FetchParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const base =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
        const params = new URLSearchParams();
        if (keyword && keyword.trim() !== "") {
          params.append("keyword", keyword.trim());
        }
        if (category && ["accompany", "companion"].includes(category)) {
          params.append("category", category);
        }

        // ✅ 修正：クエリパラメータをURLに含める
        const url = `${base}/shelters${params.toString() ? `?${params}` : ""}`;
        console.log("📡 Fetching shelters:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        console.log("shelters/APIレスポンスOK", data);

        if (Array.isArray(data.items)) {
          console.log("data.items sample:", data.items?.[0]);
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
    },
    []
  );

  return { shelters, error, loading, fetchShelters };
};
