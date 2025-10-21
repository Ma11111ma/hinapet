import { memo } from "react";

type Props = { type: "accompany" | "together"; isSelected?: boolean };

export const ShelterPin = memo(({ type, isSelected }: Props) => {
  const color = type === "accompany" ? "#1D4ED8" : "#16A34A";
  const size = isSelected ? 28 : 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
});
