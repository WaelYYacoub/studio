"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GenerateStandardForm from "@/components/forms/generate-standard-form";
import GenerateVisitorForm from "@/components/forms/generate-visitor-form";
import GenerateBatchForm from "@/components/forms/generate-batch-form";

export default function GeneratePassPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Generate Pass</h1>
        <p className="text-muted-foreground">
          Create a new gate pass for standard vehicles or visitors.
        </p>
      </div>
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="visitor">Visitor</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>
        <TabsContent value="standard">
          <GenerateStandardForm />
        </TabsContent>
        <TabsContent value="visitor">
          <GenerateVisitorForm />
        </TabsContent>
        <TabsContent value="batch">
          <GenerateBatchForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
