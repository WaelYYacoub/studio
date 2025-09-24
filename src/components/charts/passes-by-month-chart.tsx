"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { format, getMonth, isThisYear } from "date-fns";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

export function PassesByMonthChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(0, i), "MMM"),
      active: 0,
      expired: 0,
    }));

    passes.forEach((pass) => {
      const createdAtDate = pass.createdAt.toDate();
      if (isThisYear(createdAtDate)) {
        const monthIndex = getMonth(createdAtDate);
        if (pass.status === "active") {
          monthlyData[monthIndex].active += 1;
        } else if (pass.status === "expired" || pass.status === "revoked") {
          monthlyData[monthIndex].expired += 1;
        }
      }
    });

    return monthlyData;
  }, [passes]);
  
  if (loading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  return (
    <>
      <CardDescription>Active vs. Expired passes this year</CardDescription>
      <ChartContainer
        config={{
          active: { label: "Active", color: "hsl(var(--chart-1))" },
          expired: { label: "Expired", color: "hsl(var(--chart-2))" },
        }}
        className="h-[250px] w-full"
      >
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="active" stackId="a" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expired" stackId="a" fill="var(--color-expired)" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </>
  );
}
