// /app/dashboard/DashboardTabs.tsx
"use client";

import React, { useState } from "react";

function ProfilePanel() {
  return (
    <div>
      <h3>マイページ</h3>
      <p>ここにユーザー情報や編集UIを置きます。</p>
    </div>
  );
}

function PetPanel() {
  return (
    <div>
      <h3>ペット用マイページ</h3>
      <p>ここにペット情報の一覧や編集UIを置きます。</p>
    </div>
  );
}

export default function DashboardTabs() {
  const [active, setActive] = useState<"profile" | "pet">("profile");

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setActive("profile")}
          style={{
            padding: "8px 12px",
            borderBottom: active === "profile" ? "3px solid #0ea5e9" : "none",
          }}
        >
          マイページ
        </button>
        <button
          onClick={() => setActive("pet")}
          style={{
            padding: "8px 12px",
            borderBottom: active === "pet" ? "3px solid #0ea5e9" : "none",
          }}
        >
          ペットページ
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
        {active === "profile" ? <ProfilePanel /> : <PetPanel />}
      </div>
    </div>
  );
}
