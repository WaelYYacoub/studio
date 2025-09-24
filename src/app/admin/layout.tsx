import type { ReactNode } from "react";
import AuthGate from "@/components/auth/auth-gate";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <DashboardLayoutClient>
          {children}
        </DashboardLayoutClient>
      </AuthGate>
      <Toaster />
    </AuthProvider>
  );
}
