"use client";

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PassesByMonthChart } from '@/components/charts/passes-by-month-chart';
import { PassesStatusPieChart } from '@/components/charts/passes-status-pie-chart';
import { PassesByLocationChart } from '@/components/charts/passes-by-location-chart';
import { PassesByCompanyChart } from '@/components/charts/passes-by-company-chart';
import { BarChart, PieChart, Building, MapPin, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function StatisticsPage() {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = "Pass Statistics - Guardian Gate";
    const text = "Check out these pass statistics";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast({
          title: "Shared successfully",
          description: "Statistics page shared"
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copied",
      description: "Statistics page link copied to clipboard"
    });
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          nav, aside, header {
            display: none !important;
          }
          
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">Pass Statistics</h1>
            <p className="text-muted-foreground">
              Visualize pass data and gain insights into usage patterns.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 print:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Passes by Month <BarChart className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-[350px] w-full animate-pulse rounded-md bg-muted" />}>
                <PassesByMonthChart />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Pass Status <PieChart className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />}>
                <PassesStatusPieChart />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Passes by Company <Building className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Suspense fallback={<div className="h-[350px] w-full animate-pulse rounded-md bg-muted" />}>
                <PassesByCompanyChart />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Passes by Location <MapPin className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Suspense fallback={<div className="h-[350px] w-full animate-pulse rounded-md bg-muted" />}>
                <PassesByLocationChart />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
