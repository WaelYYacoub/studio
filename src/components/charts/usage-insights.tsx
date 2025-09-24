"use client";

import { useEffect, useState } from "react";
import { generatePassUsageInsights } from "@/ai/flows/generate-pass-usage-insights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { useData } from "@/context/data-provider";

export function UsageInsights() {
  const { passes, loading: dataLoading } = useData();
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getInsights() {
      if (dataLoading) return;
      
      try {
        setLoading(true);
        if (passes.length === 0) {
          setInsights("Not enough data to generate insights. Please create more passes.");
          return;
        }

        // Use a sample for performance if there are many passes
        const passesForAnalysis = passes.length > 100 ? passes.slice(0, 100) : passes;

        const passDataString = JSON.stringify(passesForAnalysis.map(p => ({
            ...p,
            createdAt: p.createdAt.toDate().toISOString(),
            expiresAt: p.expiresAt.toDate().toISOString(),
        })));
        
        const result = await generatePassUsageInsights({ passData: passDataString });
        setInsights(result.insights);
      } catch (e) {
        console.error("Error generating insights:", e);
        setError("Could not generate AI insights at this time.");
      } finally {
        setLoading(false);
      }
    }
    getInsights();
  }, [passes, dataLoading]);

  return (
    <Alert>
      <Lightbulb className="h-4 w-4" />
      <AlertTitle className="font-headline">AI-Powered Insights</AlertTitle>
      <AlertDescription>
        {(loading || dataLoading) && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating analysis of recent pass activity...</span>
          </div>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !dataLoading && !error && (
            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
        )}
      </AlertDescription>
    </Alert>
  );
}
