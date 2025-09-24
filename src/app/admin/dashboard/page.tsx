"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard/generate");
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Loading dashboard...</p>
    </div>
  );
}
