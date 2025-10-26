"use client";

import React from "react";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import DashboardTabs from "../dashboard/DashboardTabs";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardTabs />
    </ProtectedRoute>
  );
}
