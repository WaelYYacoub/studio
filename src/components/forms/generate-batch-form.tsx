"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Download, FileUp, Loader2 } from 'lucide-react';

export default function GenerateBatchForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a valid .xlsx file.",
        });
        setFile(null);
      }
    }
  };
  
  const handleDownloadSample = () => {
    // In a real app, you would provide a static file or generate one.
    const sampleHeader = "plateAlpha,plateNum,ownerName,serial,ownerCompany,location,expiresAt\n";
    const sampleRow = "ABC,1234,John Doe,SN-12345,Acme Inc.,SEC 01,2025-12-31\n";
    const blob = new Blob([sampleHeader, sampleRow], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-batch.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, 2000);
  };

  return (
    <div className="space-y-6">
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Batch File</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Your .xlsx file must contain: `plateAlpha`, `plateNum`, `ownerName`, `serial`, `ownerCompany`, `location`, and `expiresAt` (YYYY-MM-DD).
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button type="button" variant="destructive" onClick={handleDownloadSample}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample
                </Button>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Choose File
                </Button>
                 <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                 />
            </div>
            {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                </div>
            )}
        </div>

        <Button onClick={handleSubmit} type="submit" disabled={!file || isProcessing} className="w-full text-base py-6">
            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileUp className="mr-2 h-5 w-5" />}
            {isProcessing ? "Processing Batch File..." : "Process Batch File"}
        </Button>
    </div>
  );
}
