"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string>("ADMIN");

  React.useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/auth/sync-user");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role) {
            setUserRole(data.user.role);
          }
        }
      } catch {
        // quiet fallback
      }
    }
    fetchRole();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <div className="flex min-h-screen flex-col lg:pl-72 transition-all duration-300">
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          userRole={userRole}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
