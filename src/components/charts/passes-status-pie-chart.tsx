"use client";

import { Pie, PieChart, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collection, getDocs, query } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import { useEffect, useMemo, useState } from "react";
import type { Pass } from "@/types";
import { CardDescription } from "../ui/card";

export function PassesStatusPieChart() {
  const [data, setData] = useState<Pass[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "passes")).withConverter(passConverter);
      const snapshot = await getDocs(q);
      const passes = snapshot.docs.map((doc) => doc.data());
      setData(passes);
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!data.length) return [];
    const counts = data.reduce(
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
  }, [data]);
  
  const totalPasses = useMemo(() => data.length, [data]);

  if (!data.length) {
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
