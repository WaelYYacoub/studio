"use client";

import { useEffect, useRef, useMemo } from "react";
import { format, getMonth, isThisYear } from "date-fns";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";
import { Chart, ChartConfiguration, registerables } from 'chart.js';

if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

export function PassesByMonthChart() {
  const { passes, loading } = useData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(0, i), "MMM"),
      active: 0,
      expired: 0,
      revoked: 0
    }));

    passes.forEach((pass) => {
      const createdAtDate = pass.createdAt.toDate();
      if (isThisYear(createdAtDate)) {
        const monthIndex = getMonth(createdAtDate);
        
        if (pass.status === "revoked") {
          monthlyData[monthIndex].revoked += 1;
        } else if (pass.expiresAt.toDate() < now) {
          monthlyData[monthIndex].expired += 1;
        } else {
          monthlyData[monthIndex].active += 1;
        }
      }
    });

    return {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Active',
          data: monthlyData.map(d => d.active),
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 30
        },
        {
          label: 'Expired',
          data: monthlyData.map(d => d.expired),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 30
        },
        {
          label: 'Revoked',
          data: monthlyData.map(d => d.revoked),
          backgroundColor: '#eab308',
          borderColor: '#ca8a04',
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 30
        }
      ]
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
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13 },
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} passes`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f1f1' },
            ticks: {
              font: { size: 11 },
              stepSize: 1
            }
          }
        }
      },
      plugins: [{
        id: 'datalabels',
        afterDatasetsDraw(chart) {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar: any, index) => {
              const data = dataset.data[index] as number;
              if (data > 0) {
                ctx.fillStyle = '#ffffff'; // White color for all labels
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(data.toString(), bar.x, bar.y - 8);
              }
            });
          });
        }
      }]
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, loading]);

  if (loading) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  return (
    <>
      <CardDescription>Active vs. Expired passes this year</CardDescription>
      <div className="h-[350px] w-full relative">
        <canvas ref={chartRef} />
      </div>
    </>
  );
}
