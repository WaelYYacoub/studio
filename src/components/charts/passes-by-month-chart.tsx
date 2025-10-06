"use client";

import dynamic from 'next/dynamic';
import { useMemo } from "react";
import { format, getMonth, isThisYear } from "date-fns";
import { CardDescription } from "../ui/card";
import { useData } from "@/context/data-provider";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function PassesByMonthChart() {
  const { passes, loading } = useData();

  const chartData = useMemo(() => {
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(0, i), "MMM"),
      active: 0,
      expired: 0,
    }));

    passes.forEach((pass) => {
      const createdAtDate = pass.createdAt.toDate();
      if (isThisYear(createdAtDate)) {
        const monthIndex = getMonth(createdAtDate);
        
        // Calculate actual status
        let actualStatus: string;
        if (pass.status === "revoked") {
          actualStatus = "expired";
        } else if (pass.expiresAt.toDate() < now) {
          actualStatus = "expired";
        } else {
          actualStatus = "active";
        }
        
        if (actualStatus === "active") {
          monthlyData[monthIndex].active += 1;
        } else {
          monthlyData[monthIndex].expired += 1;
        }
      }
    });

    return {
      categories: monthlyData.map(d => d.month),
      series: [
        {
          name: 'Active',
          data: monthlyData.map(d => d.active)
        },
        {
          name: 'Expired',
          data: monthlyData.map(d => d.expired)
        }
      ]
    };
  }, [passes]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true
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
        colors: ['#22c55e', '#ef4444']
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
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    colors: ['#22c55e', '#ef4444'], // Green for Active, Red for Expired
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#16a34a', '#dc2626'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px'
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

  return (
    <>
      <CardDescription>Active vs. Expired passes this year</CardDescription>
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
