"use client";

import dynamic from 'next/dynamic';
import { useMemo } from "react";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PassesByLocationChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    if (!passes.length) return { categories: [], series: [] };
    
    const counts = passes.reduce((acc, pass) => {
      acc[pass.location] = (acc[pass.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedData = Object.entries(counts)
      .map(([location, count]) => ({ name: location, count }))
      .sort((a, b) => b.count - a.count);

    return {
      categories: sortedData.map(d => d.name),
      series: [{
        name: 'Passes',
        data: sortedData.map(d => d.count)
      }]
    };
  }, [passes]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#22c55e']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px'
        },
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    colors: ['#22c55e'], // Green
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#16a34a'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val + " passes";
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
    }
  };

  if (loading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  if (!chartData.categories.length) {
    return <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">No pass data available.</div>;
  }

  return (
    <>
      <CardDescription>Pass distribution by work location</CardDescription>
      <div className="h-[250px] w-full">
        <Chart
          options={options}
          series={chartData.series}
          type="bar"
          height="100%"
        />
      </div>
    </>
  );
}
