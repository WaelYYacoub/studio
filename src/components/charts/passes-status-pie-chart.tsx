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
    
    const now = new Date();
    
    // Calculate actual status for each pass
    const counts = passes.reduce(
      (acc, pass) => {
        // Determine actual status
        let actualStatus: string;
        if (pass.status === "revoked") {
          actualStatus = "revoked";
        } else if (pass.expiresAt.toDate() < now) {
          actualStatus = "expired";
        } else {
          actualStatus = "active";
        }
        
        acc[actualStatus] = (acc[actualStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return [
      { name: "Active", value: counts.active || 0, fill: "#22c55e" }, // Green
      { name: "Expired", value: counts.expired || 0, fill: "#ef4444" }, // Red
      { name: "Revoked", value: counts.revoked || 0, fill: "#dc2626" }, // Dark red
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={true}
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
