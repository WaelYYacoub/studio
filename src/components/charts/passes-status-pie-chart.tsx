"use client";

import { useEffect, useRef, useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

if (typeof window !== 'undefined') {
  Chart.register(...registerables, ChartDataLabels);
}

export function PassesStatusPieChart() {
  const { passes, loading } = useData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { chartData, totalPasses } = useMemo(() => {
    if (!passes.length) return { chartData: { data: [], labels: [] }, totalPasses: 0 };
    
    const now = new Date();
    
    const counts = passes.reduce(
      (acc, pass) => {
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
        data: [counts.active || 0, counts.expired || 0, counts.revoked || 0],
        labels: ["Active", "Expired", "Revoked"]
      },
      totalPasses: passes.length
    };
  }, [passes]);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: ['#22c55e', '#ef4444', '#dc2626'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(0);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
              size: 16
            },
            formatter: (value: number, context: any) => {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(0);
              return percentage + '%';
            }
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, loading]);

  if (loading) {
    return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  if (!chartData.data.length || chartData.data.every(d => d === 0)) {
    return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>
        Total of {totalPasses} passes in the system
      </CardDescription>
      <div className="h-[300px] w-full relative">
        <canvas ref={chartRef} />
      </div>
    </>
  );
}
