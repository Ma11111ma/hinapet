import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

type Props = { onClose: () => void };

export default function MenuAccordion({ onClose }: Props) {
  const router = useRouter();

  const go = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path);
    }, 100);
  };
  const items: { label: string; path: string }[] = [
    { label: "ペット避難の手引き", path: "/guidance" },
    { label: "ユーザー情報", path: "/mypage?tab=user" },
    { label: "ペット情報", path: "/mypage?tab=pet" },
    { label: "ペット持ち物チェックリスト", path: "/mypage?tab=pet#checklist" },
    { label: "お知らせ", path: "/mypage?tab=user#news" },
    {
      label: "避難状況チェック",
      path: "/mypage?tab=user#status",
    },
  ];

  return (
    <div
      className="
        absolute
        bottom-[1px] right-1 z-[9999]
        w-[min(88vw,15rem)] max-h-[70vh]
        flex flex-col
        overflow-y-auto
        bg-amber-50
        border border-amber-100
        rounded-lg
        shadow-md
        divide-y divide-amber-100
      "
    >
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => go(item.path)}
          className="w-full p-3 text-left text-stone-700 hover:bg-amber-100 transition"
        >
          {item.label}
        </button>
      ))}

      <button
        onClick={async () => {
          onClose(); // ✅ ログアウト時も即閉じる
          await signOut(auth);
          setTimeout(() => router.push("/login"), 100);
        }}
        className="w-full p-3 text-left text-red-700 hover:bg-red-50 transition"
      >
        ログアウト
      </button>
    </div>
  );
}
