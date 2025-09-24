"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function GenerateBatchForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an .xlsx file to upload.",
      });
      return;
    }
    setIsProcessing(true);
    
    // In a real app, you would use a library like 'sheetjs' to parse the excel file.
    // As per constraints, we are not adding new libraries. This is a placeholder.
    toast({
        title: "Processing initiated",
        description: "Batch processing is a placeholder feature. No passes were created."
    });

    setTimeout(() => {
        setIsProcessing(false);
        setFile(null);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Pass Generation</CardTitle>
        <CardDescription>
          Upload an .xlsx file to create multiple standard passes at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <FileText className="h-4 w-4"/>
          <AlertTitle>File Format</AlertTitle>
          <AlertDescription>
            Your .xlsx file must contain the following columns: `plateAlpha`, `plateNum`, `ownerName`, `expiresAt`, `serial`, `ownerCompany`, `location`. The `expiresAt` column should be in `YYYY-MM-DD` format.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch-file">Excel File (.xlsx)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="batch-file"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="file:text-primary file:font-semibold"
              />
            </div>
             {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
          </div>
          <Button type="submit" disabled={!file || isProcessing} className="w-full">
            {isProcessing ? "Processing..." : <><Upload className="mr-2 h-4 w-4" /> Upload and Process</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
