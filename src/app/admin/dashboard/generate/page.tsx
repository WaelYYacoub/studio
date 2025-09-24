"use client";

import { useState } from "react";
import GenerateStandardForm from "@/components/forms/generate-standard-form";
import GenerateVisitorForm from "@/components/forms/generate-visitor-form";
import GenerateBatchForm from "@/components/forms/generate-batch-form";
import { cn } from "@/lib/utils";
import { Car, User, Bot } from "lucide-react";

const passTypes = [
    { id: 'standard', label: 'Standard', icon: Car },
    { id: 'visitor', label: 'Visitor', icon: User },
    { id: 'batch', label: 'Batch', icon: Bot },
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
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Generate Pass</h1>
        <p className="text-muted-foreground">
          Create a new gate pass for standard vehicles, visitors, or a batch of vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-2">
            {passTypes.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => setPassType(item.id)}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition-all hover:text-primary",
                        passType === item.id && "bg-muted text-primary"
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            ))}
        </div>
        
        <div className="md:col-start-2">
          {renderForm()}
        </div>
      </div>
    </div>
  );
}
