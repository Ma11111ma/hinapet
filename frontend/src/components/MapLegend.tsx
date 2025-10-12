"use client";

export default function MapLegend() {
  const legendStyle = {
    position: "absolute" as const,
    bottom: "20px",
    left: "20px",
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    fontSize: "14px",
  };

  const items = [
    { color: "🔵", label: "同行避難（accompany）" },
    { color: "🟢", label: "同伴避難（companion）" },
  ];

  return (
    <div style={legendStyle}>
      <strong>凡例</strong>
      <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0 0" }}>
        {items.map((item) => (
          <li key={item.label}>
            {item.color}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
