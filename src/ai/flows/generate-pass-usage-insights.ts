'use server';
/**
 * @fileOverview An AI agent for generating insights on pass usage data.
 *
 * - generatePassUsageInsights - A function that generates insights on pass usage data.
 * - GeneratePassUsageInsightsInput - The input type for the generatePassUsageInsights function.
 * - GeneratePassUsageInsightsOutput - The return type for the generatePassUsageInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePassUsageInsightsInputSchema = z.object({
  passData: z.string().describe('JSON string array of pass data for analysis.'),
});
export type GeneratePassUsageInsightsInput = z.infer<typeof GeneratePassUsageInsightsInputSchema>;

const GeneratePassUsageInsightsOutputSchema = z.object({
  insights: z.string().describe('Insights on pass usage data including peak times, common visitors, and potential security risks.'),
});
export type GeneratePassUsageInsightsOutput = z.infer<typeof GeneratePassUsageInsightsOutputSchema>;

export async function generatePassUsageInsights(input: GeneratePassUsageInsightsInput): Promise<GeneratePassUsageInsightsOutput> {
  return generatePassUsageInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePassUsageInsightsPrompt',
  input: {schema: GeneratePassUsageInsightsInputSchema},
  output: {schema: GeneratePassUsageInsightsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing gate pass data to identify usage patterns, peak times, common visitors, and potential security risks.

  Analyze the following pass data and generate insights that can help optimize resource allocation and improve overall security measures. The pass data will be provided as a stringified JSON array.

  Pass Data: {{{passData}}}

  Provide a detailed analysis covering:
  - Peak usage times and days of the week.
  - Most frequent visitors or visitor types (if visitor data is available).
  - Potential security risks based on the data, such as unusual access patterns or expired passes still in use.

  Focus on actionable insights that can be implemented to enhance security and efficiency.`, 
});

const generatePassUsageInsightsFlow = ai.defineFlow(
  {
    name: 'generatePassUsageInsightsFlow',
    inputSchema: GeneratePassUsageInsightsInputSchema,
    outputSchema: GeneratePassUsageInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
