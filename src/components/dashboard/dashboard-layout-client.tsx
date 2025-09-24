"use client";

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarNav from "@/components/dashboard/sidebar-nav";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayoutClient({ children }: { children: React.React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
