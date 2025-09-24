"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import { useEffect, useMemo, useState } from "react";
import type { Pass } from "@/types";
import { format, startOfYear, endOfYear, getMonth } from "date-fns";
import { CardDescription } from "../ui/card";

export function PassesByMonthChart() {
  const [data, setData] = useState<Pass[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const currentYearStart = startOfYear(new Date());
      const currentYearEnd = endOfYear(new Date());

      const q = query(
        collection(db, "passes"),
        where("createdAt", ">=", currentYearStart),
        where("createdAt", "<=", currentYearEnd)
      ).withConverter(passConverter);

      const snapshot = await getDocs(q);
      const passes = snapshot.docs.map((doc) => doc.data());
      setData(passes);
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(0, i), "MMM"),
      active: 0,
      expired: 0,
    }));

    data.forEach((pass) => {
      const monthIndex = getMonth(pass.createdAt.toDate());
      if (pass.status === "active") {
        monthlyData[monthIndex].active += 1;
      } else if (pass.status === "expired" || pass.status === "revoked") {
        monthlyData[monthIndex].expired += 1;
      }
    });

    return monthlyData;
  }, [data]);
  
  if (!data.length) {
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
