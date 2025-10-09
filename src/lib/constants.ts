import {
  LayoutDashboard,
  ListOrdered,
  CirclePlus,
  Search,
  ChartNoAxesColumn,
  Users,
  ScanLine,
  Share2
} from 'lucide-react';

export const NAV_LINKS = [
  {
    label: 'Verifier',
    href: '/verifier',
    icon: ScanLine,
  },
  {
    label: 'Generate',
    href: '/admin/dashboard/generate',
    icon: CirclePlus,
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    submenu: [
      {
        label: 'Records',
        href: '/admin/dashboard/records',
        icon: ListOrdered,
      },
      {
        label: 'Search Pass',
        href: '/admin/dashboard/search',
        icon: Search,
      },
      {
        label: 'Statistics',
        href: '/admin/dashboard/statistics',
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    label: 'Manage Users',
    href: '/admin/dashboard/users',
    icon: Users,
  },
  {
    label: 'Gate Guard',
    href: '/gate-guard',
    icon: Share2,
  },
];

export const LOCATIONS = [
  'SEC 01', 'SEC 02', 'SEC 03', 'SEC 04', 'SEC 05',
  'SEC 06', 'SEC 07', 'SEC 08', 'SEC 09', 'SEC 10',
  'LD 01', 'LD 02', 'LD 03', 'LD 04', 'LD 05', 'LD 06',
  'Pump Station',
];
