import {
  LayoutDashboard,
  PlusCircle,
  Search,
  ListOrdered,
  BarChart2,
  Users,
} from "lucide-react";

export const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/records", label: "Records", icon: ListOrdered },
  { href: "/admin/dashboard/generate", label: "Generate", icon: PlusCircle },
  { href: "/admin/dashboard/search", label: "Search", icon: Search },
  { href: "/admin/dashboard/statistics", label: "Statistics", icon: BarChart2 },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
];
