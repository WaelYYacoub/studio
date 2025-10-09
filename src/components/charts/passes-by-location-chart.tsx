"use client";

import { useEffect, useRef, useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";
import { Chart, ChartConfiguration, registerables } from 'chart.js';

if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

export function PassesByLocationChart() {
  const { passes, loading } = useData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    if (!passes.length) return { labels: [], data: [] };
    
    const counts = passes.reduce((acc, pass) => {
      acc[pass.location] = (acc[pass.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedData = Object.entries(counts)
      .map(([location, count]) => ({ name: location, count }))
      .sort((a, b) => b.count - a.count);

    return {
      labels: sortedData.map(d => d.name),
      data: sortedData.map(d => d.count)
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
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Passes',
          data: chartData.data,
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} passes`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              maxRotation: 45,
              minRotation: 45
            }
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
                ctx.fillStyle = '#22c55e';
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

  if (!chartData.labels.length) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>Pass distribution by work location</CardDescription>
      <div className="h-[350px] w-full relative">
        <canvas ref={chartRef} />
      </div>
    </>
  );
}
