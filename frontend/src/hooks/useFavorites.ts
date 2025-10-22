// src/hooks/useFavorites.ts
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { auth } from "@/lib/firebaseClient";

// APIレスポンスの型
type FavoriteItem = {
  shelter_id: string;
  created_at?: string;
};

type FavoriteListResponse = {
  items: FavoriteItem[];
};

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Firebaseトークンを取得する関数
  const getIdToken = async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  // 一覧取得
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = await getIdToken();
      if (!token) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data: FavoriteListResponse = await res.json();
        setFavorites(data.items.map((i) => i.shelter_id));
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]); // user変更時に再取得

  // 追加
  const addFavorite = async (shelterId: string) => {
    const token = await getIdToken();
    if (!token) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${shelterId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) setFavorites((prev) => [...prev, shelterId]);
  };

  // 削除
  const removeFavorite = async (shelterId: string) => {
    const token = await getIdToken();
    if (!token) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${shelterId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) setFavorites((prev) => prev.filter((id) => id !== shelterId));
  };

  const isFavorite = (shelterId: string) => favorites.includes(shelterId);

  return { favorites, loading, isFavorite, addFavorite, removeFavorite };
}
