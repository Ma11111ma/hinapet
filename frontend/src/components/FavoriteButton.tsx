// frontend/src/components/FavoriteButton.tsx
"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star, StarOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/features/auth/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

type Props = {
  shelterId: string;
  className?: string;
  ariaLabelAdd?: string;
  ariaLabelRemove?: string;
};

export const FavoriteButton = memo(function FavoriteButton({
  shelterId,
  className,
}: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    loading: favLoading,
  } = useFavorites();

  const fav = isFavorite(shelterId);
  const busy = authLoading || favLoading;

  const handleClick = useCallback(async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      if (fav) {
        await removeFavorite(shelterId);
        toast.success("保存を削除しました");
      } else {
        await addFavorite(shelterId);
        toast.success("保存しました");
      }
    } catch (e) {
      toast.error("保存に失敗しました");
      console.error(e);
    }
  }, [user, fav, removeFavorite, addFavorite, shelterId, router]);

  if (!user && !authLoading) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={fav}
      // ✅ hover時に影・スケール・透過度を加える
      className={`relative text-2xl leading-none transition-all duration-200 ease-in-out transform 
                  hover:scale-110 hover:opacity-90 hover:drop-shadow-md 
                  active:scale-95 disabled:opacity-50 ${className}`}
      title={fav ? "お気に入り解除" : "お気に入り登録"}
    >
      {fav ? (
        // filled 表現（a11y のため stroke は維持）
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-500 drop-shadow-sm transition-colors duration-200" />
      ) : (
        <StarOff className="h-5 w-5 text-gray-400 transition-colors duration-200 hover:text-yellow-400" />
      )}
    </button>
  );
});
