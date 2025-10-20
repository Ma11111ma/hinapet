"use client";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import DashboardTabs from "./DashboardTabs";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardTabs />
    </ProtectedRoute>
  );
}
