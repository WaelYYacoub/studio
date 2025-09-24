"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/types";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
