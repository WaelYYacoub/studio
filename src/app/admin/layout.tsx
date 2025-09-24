import type { ReactNode } from "react";
import AuthGate from "@/components/auth/auth-gate";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from "@/context/data-provider";
import SidebarNav from "@/components/dashboard/sidebar-nav";
import { Header } from "@/components/dashboard/header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <DataProvider>
          <div className="flex h-screen bg-background">
            <aside className="w-72 border-r bg-background flex flex-col">
              <SidebarNav />
            </aside>
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </DataProvider>
      </AuthGate>
      <Toaster />
    </AuthProvider>
  );
}
