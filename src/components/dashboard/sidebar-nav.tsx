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
  Share2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import RoleGate from "../auth/role-gate";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useToast } from "@/hooks/use-toast";

const dashboardItems = [
  { href: "/admin/dashboard/records", label: "Records", icon: ListOrdered },
  { href: "/admin/dashboard/search", label: "Search Pass", icon: Search },
  { href: "/admin/dashboard/statistics", label: "Statistics", icon: BarChart2 },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gate-guard`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guardian Gate Guard',
          text: 'Access the gate guard verification page.',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link Copied!",
          description: "The Gate Guard page link has been copied to your clipboard.",
        });
      });
    }
  };

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
            className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 font-medium ${
              pathname === '/verifier' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Verifier</span>
          </button>
        </Link>

        <Link href="/admin/dashboard/generate">
          <button
            className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 font-medium ${
              pathname === '/admin/dashboard/generate' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Generate</span>
          </button>
        </Link>

        <Collapsible open={isDashboardOpen} onOpenChange={setIsDashboardOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
             <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isDashboardOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-4">
            {dashboardItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                   <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 ${
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
            })}
          </CollapsibleContent>
        </Collapsible>

        <RoleGate allowedRoles={["admin", "owner"]}>
          <Link href="/admin/dashboard/users">
            <button
              className={`w-full text-left rounded-md px-3 py-2 transition-colors flex items-center gap-3 font-medium ${
                pathname === '/admin/dashboard/users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </button>
          </Link>
        </RoleGate>

        <Button
          variant="ghost"
          onClick={handleShare}
          className="w-full justify-start font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Share2 className="h-4 w-4 mr-3" />
          <span>Gate Guard</span>
        </Button>
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
