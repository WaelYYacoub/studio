"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListOrdered,
  PlusCircle,
  Search,
  BarChart2,
  Users,
  ShieldCheck,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import RoleGate from "../auth/role-gate";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

const navItems = [
  { href: "/admin/dashboard/generate", label: "Generate Pass", icon: PlusCircle },
  { href: "/admin/dashboard/records", label: "All Pass Records", icon: ListOrdered },
  { href: "/admin/dashboard/search", label: "Pass Search", icon: Search },
  { href: "/admin/dashboard/statistics", label: "Pass Statistics", icon: BarChart2 },
  {
    href: "/admin/dashboard/users",
    label: "Manage Users",
    icon: Users,
    roles: ["admin", "owner"],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <div>
                <p className="font-headline text-lg font-semibold">Guardian</p>
            </div>
        </div>
      </div>
      <div className="p-4 border-b">
         <p className="text-sm text-muted-foreground">Welcome, {user?.fullName}</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <Link href="/verifier">
          <button
            className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-muted`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Verifier</span>
          </button>
        </Link>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
             <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-4">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const linkContent = (
                   <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );

                if (item.roles) {
                  return <RoleGate key={item.href} allowedRoles={item.roles as any}>{linkContent}</RoleGate>;
                }
                return linkContent;
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>
      <div className="p-4 border-t mt-auto">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
            {user && (
                <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
            )}
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </div>
    </div>
  );
}
