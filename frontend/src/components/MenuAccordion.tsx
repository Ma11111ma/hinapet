import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

type Props = { onClose: () => void };

export default function MenuAccordion({ onClose }: Props) {
  const router = useRouter();

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const items: { label: string; path: string }[] = [
    { label: "ペット避難の手引き", path: "/guidance" },
    { label: "ユーザー情報", path: "/mypage?tab=user" },
    { label: "ペット情報", path: "/mypage?tab=pet" },
    { label: "ペット持ち物チェックリスト", path: "/mypage?tab=pet#checklist" },
    { label: "お知らせ", path: "/mypage?tab=user#news" },
    {
      label: "避難状況チェック（プレミアム）",
      path: "/mypage?tab=user#status",
    },
  ];

  return (
    <div className="flex flex-col divide-y">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => go(item.path)}
          className="p-3 text-left hover:bg-amber-50"
        >
          {item.label}
        </button>
      ))}

      <button
        onClick={async () => {
          await signOut(auth);
          onClose();
          router.push("/login");
        }}
        className="p-3 text-left text-red-600 hover:bg-red-50"
      >
        ログアウト
      </button>
    </div>
  );
}
