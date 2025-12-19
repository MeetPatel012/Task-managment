"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { useAuthStore } from "@/store/useAuthStore";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
