import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PassesByMonthChart } from '@/components/charts/passes-by-month-chart';
import { PassesStatusPieChart } from '@/components/charts/passes-status-pie-chart';
import { PassesByLocationChart } from '@/components/charts/passes-by-location-chart';
import { PassesByCompanyChart } from '@/components/charts/passes-by-company-chart';
import { BarChart, PieChart, Building, MapPin } from 'lucide-react';
import { UsageInsights } from '@/components/charts/usage-insights';

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Pass Statistics</h1>
        <p className="text-muted-foreground">
          Visualize pass data and gain insights into usage patterns.
        </p>
      </div>

      <Suspense fallback={<p>Loading insights...</p>}>
        <UsageInsights />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Passes by Month <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[250px] w-full animate-pulse rounded-md bg-muted" />}>
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
            <Suspense fallback={<div className="h-[250px] w-full animate-pulse rounded-md bg-muted" />}>
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
             <Suspense fallback={<div className="h-[250px] w-full animate-pulse rounded-md bg-muted" />}>
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
             <Suspense fallback={<div className="h-[250px] w-full animate-pulse rounded-md bg-muted" />}>
              <PassesByLocationChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
