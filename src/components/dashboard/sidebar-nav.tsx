"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  ListOrdered,
  BarChart2,
  Users,
  ShieldCheck,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import RoleGate from "../auth/role-gate";

const navItems = [
  { href: "/admin/dashboard/records", label: "Records", icon: ListOrdered },
  { href: "/admin/dashboard/generate", label: "Generate", icon: PlusCircle },
  { href: "/admin/dashboard/search", label: "Search", icon: Search },
  { href: "/admin/dashboard/statistics", label: "Statistics", icon: BarChart2 },
  {
    href: "/admin/dashboard/users",
    label: "Users",
    icon: Users,
    roles: ["admin", "owner"],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <div>
                <p className="font-headline text-lg font-semibold">GuardianGate</p>
                <p className="text-xs text-muted-foreground -mt-1">Welcome, {user?.fullName?.split(' ')[0]}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const link = (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
            if (item.roles) {
              return <RoleGate key={item.href} allowedRoles={item.roles as any}>{link}</RoleGate>;
            }
            return link;
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t mt-auto">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </SidebarFooter>
    </>
  );
}
