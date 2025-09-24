"use client";

import { useState } from "react";
import GenerateStandardForm from "@/components/forms/generate-standard-form";
import GenerateVisitorForm from "@/components/forms/generate-visitor-form";
import GenerateBatchForm from "@/components/forms/generate-batch-form";
import { Car, User, FileUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const passTypes = [
    { id: 'standard', label: 'Standard', icon: Car },
    { id: 'visitor', label: 'Visitor', icon: User },
    { id: 'batch', label: 'Batch Upload', icon: FileUp },
]

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
    <div className="space-y-6 mx-auto max-w-2xl">
      <div className="text-center md:text-left">
        <h1 className="font-headline text-3xl font-bold">Create New Gate Pass</h1>
        <p className="text-muted-foreground">
          Fill in the details to generate a new pass.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="space-y-2 mb-6">
                 <label className="text-sm font-medium">Pass Type</label>
                <Select value={passType} onValueChange={setPassType}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select pass type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {passTypes.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {renderForm()}
        </CardContent>
      </Card>
    </div>
  );
}
