"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role === "pending" || role === "rejected") {
        router.replace("/login?pending=1");
      }
    }
  }, [user, loading, role, router]);

  if (loading || !user || !role || role === 'pending' || role === 'rejected') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
