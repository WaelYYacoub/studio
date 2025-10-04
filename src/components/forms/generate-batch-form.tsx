"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Download, FileUp, Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { buildQrPayload } from "@/lib/qr";
import type { Pass } from "@/types";

export default function GenerateBatchForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === "text/csv") {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a valid .csv file.",
        });
        setFile(null);
      }
    }
  };
  
  const handleDownloadSample = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "User not found",
        description: "You must be logged in to download the sample.",
      });
      return;
    }
    
    const locations = ["SEC 01", "SEC 02", "SEC 03", "SEC 04", "SEC 05", "SEC 06", "SEC 07", "SEC 08", "SEC 09", "SEC 10", "LD 01", "LD 02", "LD 03", "LD 04", "LD 05", "LD 06", "Pump Station"];

    const header = "type,plateAlpha,plateNum,ownerName,serial,ownerCompany,location,expiresAt,status,createdAt,createdBy,createdByName,createdByCompany\n";
    
    const comments = [
      `# Field 'type': Use 'standard' or 'visitor'`,
      `# Field 'status': Use 'active', 'expired', or 'revoked'`,
      `# Field 'location': Choose from: ${locations.join(', ')}`,
      `# Fields 'createdAt', 'createdBy', 'createdByName', 'createdByCompany' will be pre-filled from your session if left blank.`,
      `# Date format for 'expiresAt' and 'createdAt' should be YYYY-MM-DD`,
    ].join('\n') + '\n';
      
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const sampleRow1 = [
      'standard', 'ABC', '1234', 'John Doe', 'SN-12345', 'Acme Inc.', 'SEC 01', format(expiryDate, 'yyyy-MM-dd'), 'active', format(now, 'yyyy-MM-dd'), user.uid, user.fullName, user.company
    ].join(',');

    const sampleRow2 = [
        'visitor', 'XYZ', '9876', 'Jane Smith (Visitor)', ''/*serial*/, ''/*ownerCompany*/, 'SEC 02', format(now, 'yyyy-MM-dd'), 'active', format(now, 'yyyy-MM-dd'), user.uid, user.fullName, user.company
    ].join(',');
    
    const csvContent = comments + header + sampleRow1 + '\n' + sampleRow2 + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
    if (!file || !user) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Please select a .csv file and ensure you are logged in.",
      });
      return;
    }
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            toast({ variant: "destructive", title: "Error", description: "Could not read the file." });
            setIsProcessing(false);
            return;
        }

        const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const header = lines.shift()?.trim().split(',') || [];
        const passesRef = collection(db, "passes");
        const batch = writeBatch(db);

        let successCount = 0;
        let errorCount = 0;

        for (const line of lines) {
            const values = line.trim().split(',');
            if (values.length !== header.length) {
                errorCount++;
                continue;
            }

            const entry = header.reduce((obj, key, index) => {
                obj[key.trim()] = values[index].trim();
                return obj;
            }, {} as Record<string, string>);

            try {
                const passType = entry.type?.toLowerCase();
                if (passType !== 'standard' && passType !== 'visitor') {
                  errorCount++;
                  continue;
                }

                const expiryDate = new Date(entry.expiresAt);
                
                // Create new document reference with auto-generated ID
                const newDocRef = doc(passesRef);
                
                // Build qrPayload using the generated document ID
                const qrPayload = buildQrPayload(
                  newDocRef.id, 
                  entry.plateAlpha.toUpperCase(), 
                  entry.plateNum, 
                  expiryDate
                );

                const newPass: Partial<Pass> = {
                    type: passType,
                    plateAlpha: entry.plateAlpha.toUpperCase(),
                    plateNum: entry.plateNum,
                    location: entry.location,
                    expiresAt: expiryDate,
                    status: entry.status as any,
                    createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
                    createdBy: entry.createdBy || user.uid,
                    createdByName: entry.createdByName || user.fullName,
                    createdByCompany: entry.createdByCompany || user.company,
                    qrPayload: qrPayload, // FIX: Add qrPayload to each pass
                };

                if (passType === 'standard') {
                    (newPass as any).ownerName = entry.ownerName;
                    (newPass as any).serial = entry.serial;
                    (newPass as any).ownerCompany = entry.ownerCompany;
                } else { // visitor
                    (newPass as any).visitorName = entry.ownerName; // Using ownerName for visitor name as per sample
                    (newPass as any).personToVisit = 'N/A'; // Placeholder as not in CSV
                    (newPass as any).purpose = 'N/A'; // Placeholder as not in CSV
                }
                
                batch.set(newDocRef, newPass);
                successCount++;

            } catch (parseError) {
                console.error("Error parsing line:", line, parseError);
                errorCount++;
            }
        }

        if (successCount > 0) {
            await batch.commit();
        }

        toast({
            title: "Batch Processing Complete",
            description: `${successCount} passes created successfully. ${errorCount} rows failed.`,
        });

        setIsProcessing(false);
        setFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to read the file."});
        setIsProcessing(false);
    }
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Batch File</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Download the sample .csv file to see the required format and columns.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button type="button" variant="outline" onClick={handleDownloadSample}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample .csv
                </Button>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Choose File
                </Button>
                 <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,text/csv"
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