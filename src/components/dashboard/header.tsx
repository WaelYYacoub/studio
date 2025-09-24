"use client";

import { UserNav } from "./user-nav";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import RoleGate from "../auth/role-gate";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
       <div className="flex items-center gap-2">
         <RoleGate allowedRoles={['admin', 'owner']}>
           <Link href="/verifier" className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
             <ShieldAlert className="h-5 w-5"/>
             Public Verifier
           </Link>
         </RoleGate>
       </div>
      <div className="ml-auto flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
