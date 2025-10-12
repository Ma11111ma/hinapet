import { useEffect, useState } from "react";

export type Shelter = {
  id: number;
  name: string;
  address: string;
  type: string;
  capacity: string;
  lat: number;
  lng: number;
};

export const useShelters = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${base}/shelters`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        console.log("shelters/APIレスポンスOK", data);

        if (Array.isArray(data.items)) {
          setShelters(data.items);
        } else {
          console.error("🚨 Unexpected API format:", data);
          setShelters([]);
        }
      } catch (err) {
        console.error(err);
        setError("避難所データを取得できませんでした。");
      }
    };
    fetchShelters();
  }, []);

  return { shelters, error };
};
