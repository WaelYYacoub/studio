"use client";

import dynamic from 'next/dynamic';
import { useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PassesStatusPieChart() {
  const { passes, loading } = useData();

  const { chartData, totalPasses } = useMemo(() => {
    if (!passes.length) return { chartData: { series: [], labels: [] }, totalPasses: 0 };
    
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

    return {
      chartData: {
        series: [counts.active || 0, counts.expired || 0, counts.revoked || 0],
        labels: ["Active", "Expired", "Revoked"]
      },
      totalPasses: passes.length
    };
  }, [passes]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      toolbar: {
        show: false
      }
    },
    labels: chartData.labels,
    colors: ['#22c55e', '#ef4444', '#dc2626'], // Green, Red, Dark Red
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return Math.round(val) + "%";
      },
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.8
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        dataLabels: {
          offset: 0,
          minAngleToShowLabel: 10
        }
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#fff']
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val: number) {
          return val + " passes";
        }
      }
    }
  };

  if (loading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  if (!chartData.series.length || chartData.series.every(s => s === 0)) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>
        Total of {totalPasses} passes in the system
      </CardDescription>
      <div className="h-[250px] w-full">
        <Chart
          options={options}
          series={chartData.series}
          type="pie"
          height="100%"
        />
      </div>
    </>
  );
}
