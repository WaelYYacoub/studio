"use client";

import { useEffect, useState } from "react";
import { generatePassUsageInsights } from "@/ai/flows/generate-pass-usage-insights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, AlertCircle } from "lucide-react";
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
        setError("");
        
        if (passes.length === 0) {
          setInsights("Not enough data to generate insights. Please create more passes.");
          setLoading(false);
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
        // Set a user-friendly error message instead of crashing
        setError("AI insights are temporarily unavailable. The statistics charts below are still working.");
      } finally {
        setLoading(false);
      }
    }
    getInsights();
  }, [passes, dataLoading]);

  // Don't show anything while data is loading
  if (dataLoading) {
    return null;
  }

  // Show error state without crashing the page
  if (error) {
    return (
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-headline">AI Insights Unavailable</AlertTitle>
        <AlertDescription>
          <p className="text-muted-foreground">{error}</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Lightbulb className="h-4 w-4" />
      <AlertTitle className="font-headline">AI-Powered Insights</AlertTitle>
      <AlertDescription>
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating analysis of recent pass activity...</span>
          </div>
        )}
        {!loading && insights && (
            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
        )}
      </AlertDescription>
    </Alert>
  );
}
