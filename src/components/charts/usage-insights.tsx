"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import { generatePassUsageInsights } from "@/ai/flows/generate-pass-usage-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import type { Pass } from "@/types";

export function UsageInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getInsights() {
      try {
        setLoading(true);
        // Fetch a sample of recent passes for analysis
        const q = query(collection(db, "passes"), limit(100)).withConverter(passConverter);
        const snapshot = await getDocs(q);
        const passes: Pass[] = snapshot.docs.map(doc => doc.data());

        if (passes.length === 0) {
          setInsights("Not enough data to generate insights. Please create more passes.");
          return;
        }

        const passDataString = JSON.stringify(passes.map(p => ({
            ...p,
            // Convert Firestore Timestamps to ISO strings for the AI
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
  }, []);

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
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !error && (
            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
        )}
      </AlertDescription>
    </Alert>
  );
}
