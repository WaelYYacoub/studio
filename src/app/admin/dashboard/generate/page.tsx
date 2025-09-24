"use client";

import { useState } from "react";
import GenerateStandardForm from "@/components/forms/generate-standard-form";
import GenerateVisitorForm from "@/components/forms/generate-visitor-form";
import GenerateBatchForm from "@/components/forms/generate-batch-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function GeneratePassPage() {
  const [passType, setPassType] = useState("standard");

  const renderForm = () => {
    switch (passType) {
      case "standard":
        return <GenerateStandardForm />;
      case "visitor":
        return <GenerateVisitorForm />;
      case "batch":
        return <GenerateBatchForm />;
      default:
        return <GenerateStandardForm />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Generate Pass</h1>
        <p className="text-muted-foreground">
          Create a new gate pass for standard vehicles, visitors, or a batch of vehicles.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <Label htmlFor="pass-type-select">Pass Type</Label>
        <Select value={passType} onValueChange={setPassType}>
          <SelectTrigger id="pass-type-select" className="w-full">
            <SelectValue placeholder="Select a pass type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="visitor">Visitor</SelectItem>
            <SelectItem value="batch">Batch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">{renderForm()}</div>
    </div>
  );
}
