"use client";

import { Pie, PieChart, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

export function PassesStatusPieChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    if (!passes.length) return [];
    const counts = passes.reduce(
      (acc, pass) => {
        acc[pass.status] = (acc[pass.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    
    return [
      { name: "Active", value: counts.active || 0, fill: "hsl(var(--chart-1))" },
      { name: "Expired", value: counts.expired || 0, fill: "hsl(var(--chart-2))" },
      { name: "Revoked", value: counts.revoked || 0, fill: "hsl(var(--chart-3))" },
    ].filter(item => item.value > 0);
  }, [passes]);
  
  const totalPasses = useMemo(() => passes.length, [passes]);

  if (loading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }
  
  if (!chartData.length) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>
        Total of {totalPasses} passes in the system
      </CardDescription>
      <ChartContainer
        config={{}}
        className="h-[250px] w-full"
      >
        <PieChart>
          <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={0}
            activeShape={({
                outerRadius = 0,
                ...props
            }) => (
                <g>
                    <path d={props.d} fill={props.fill} />
                    <path d={props.d} filter="url(#glow)" stroke={props.fill} strokeWidth={2} />
                </g>
            )}
            >
          </Pie>
        </PieChart>
      </ChartContainer>
    </>
  );
}
