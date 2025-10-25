"use client";

export default function UserInfoForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">飼い主情報</h2>
      <form className="flex flex-col gap-3">
        <label>
          氏名
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="例：山田 太郎"
          />
        </label>
        <label>
          電話番号
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="090-1234-5678"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-amber-500 text-white py-2 rounded-md mt-3 hover:bg-amber-600"
        >
          保存
        </button>
      </form>
    </div>
  );
}
