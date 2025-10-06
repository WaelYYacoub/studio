"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

export function PassesByCompanyChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    if (!passes.length) return [];
    const counts = passes.reduce((acc, pass) => {
      const company = pass.type === 'standard' ? pass.ownerCompany : pass.createdByCompany || 'N/A';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([company, count]) => ({ name: company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [passes]);

  if (loading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  if (!chartData.length) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>Top 10 companies by passes issued</CardDescription>
      <ChartContainer
        config={{
          count: {
            label: "Passes",
            color: "#22c55e", // Green
          },
        }}
        className="h-[250px] w-full"
      >
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="#22c55e" radius={4}>
            <LabelList dataKey="count" position="top" style={{ fill: '#22c55e', fontWeight: 'bold', fontSize: '12px' }} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </>
  );
}
