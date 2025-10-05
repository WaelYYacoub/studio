"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import AuthGate from "@/components/auth/auth-gate";
import RoleGate from "@/components/auth/role-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();

  return (
    <AuthGate>
      <RoleGate allowedRoles={["owner", "admin"]}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-card">
            <div className="flex h-16 items-center gap-2 border-b px-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg font-bold">GuardianGate</span>
            </div>
            
            <nav className="space-y-1 p-4">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-secondary"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-background px-6">
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Role: {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-secondary/30 p-6">
              {children}
            </main>
          </div>
        </div>
      </RoleGate>
    </AuthGate>
  );
}