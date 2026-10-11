"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/src/components/dashboard/Sidebar";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import UserGuard from "@/src/components/auth/UserGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isSharedRoute = pathname === "/dashboard/profil";

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        isMenuOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 bg-white">
          {isAdminRoute || isSharedRoute ? (
            children
          ) : (
            <UserGuard>{children}</UserGuard>
          )}
        </main>
      </div>
    </div>
  );
}
