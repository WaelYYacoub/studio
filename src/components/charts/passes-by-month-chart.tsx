"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { useMemo } from "react";
import { format, getMonth, isThisYear } from "date-fns";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

export function PassesByMonthChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(0, i), "MMM"),
      Active: 0,
      Expired: 0,
      Revoked: 0
    }));

    passes.forEach((pass) => {
      const createdAtDate = pass.createdAt.toDate();
      if (isThisYear(createdAtDate)) {
        const monthIndex = getMonth(createdAtDate);
        
        if (pass.status === "revoked") {
          monthlyData[monthIndex].Revoked += 1;
        } else if (pass.expiresAt.toDate() < now) {
          monthlyData[monthIndex].Expired += 1;
        } else {
          monthlyData[monthIndex].Active += 1;
        }
      }
    });

    return monthlyData;
  }, [passes]);

  if (loading) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <>
      <CardDescription>Active vs. Expired passes this year</CardDescription>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Active" stackId="stack" fill="#22c55e" radius={[0, 0, 0, 0]}>
            <LabelList dataKey="Active" position="center" fill="#fff" fontWeight="bold" formatter={(value: number) => value || ''} />
          </Bar>
          <Bar dataKey="Expired" stackId="stack" fill="#ef4444" radius={[0, 0, 0, 0]}>
            <LabelList dataKey="Expired" position="center" fill="#fff" fontWeight="bold" formatter={(value: number) => value || ''} />
          </Bar>
          <Bar dataKey="Revoked" stackId="stack" fill="#eab308" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="Revoked" position="center" fill="#fff" fontWeight="bold" formatter={(value: number) => value || ''} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
