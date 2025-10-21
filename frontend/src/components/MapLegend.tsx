"use client";

export default function MapLegend() {
  const items = [
    { color: "bg-blue-500", label: "同行避難（accompany）" },
    { color: "bg-green-500", label: "同伴避難（companion）" },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow-md text-sm">
      <strong className="block mb-1">避難種別</strong>
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
