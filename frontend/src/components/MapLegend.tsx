"use client";

export default function MapLegend() {
  const items = [
    { color: "bg-blue-500", label: "同行避難（ペットは別スペース）" },
    { color: "bg-green-500", label: "同伴避難（ペットも居住地に一緒に避難）" },
  ];

  return (
    <div
      className="
        fixed bottom-[56px] left-4 z-40
        bg-white/95 border border-gray-200 shadow-md
        rounded-lg px-5 py-3
        text-sm w-[70%] max-w-[420px]
      "
    >
      <strong className="block mb-1 text-gray-800">避難種別</strong>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
