"use client";

import { Button } from "@/components/ui/button";
import { Ban, Trash2, Download, Printer, X } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { Pass } from "@/types";
import { format } from "date-fns";

interface BulkActionsBarProps {
  selectedPasses: Pass[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export function BulkActionsBar({ selectedPasses, onClearSelection, onActionComplete }: BulkActionsBarProps) {
  const { toast } = useToast();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activePassCount = selectedPasses.filter(p => p.status === "active").length;
  const selectedCount = selectedPasses.length;

  const handleBulkRevoke = async () => {
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      const activePasses = selectedPasses.filter(p => p.status === "active");
      
      activePasses.forEach((pass) => {
        const passRef = doc(db, "passes", pass.id);
        batch.update(passRef, { status: "revoked" });
      });

      await batch.commit();
      
      toast({
        title: "Passes Revoked",
        description: `Successfully revoked ${activePasses.length} pass(es).`,
      });
      
      onActionComplete();
      onClearSelection();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke passes.",
      });
    } finally {
      setIsProcessing(false);
      setShowRevokeDialog(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      
      selectedPasses.forEach((pass) => {
        const passRef = doc(db, "passes", pass.id);
        batch.delete(passRef);
      });

      await batch.commit();
      
      toast({
        title: "Passes Deleted",
        description: `Successfully deleted ${selectedCount} pass(es).`,
      });
      
      onActionComplete();
      onClearSelection();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete passes.",
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Plate", "Type", "Owner/Visitor", "Company", "Status", "Expires At", "Location", "Created By", "Created At"];
    
    const rows = selectedPasses.map(pass => [
      `${pass.plateAlpha}-${pass.plateNum}`,
      pass.type,
      pass.type === "standard" ? pass.ownerName : pass.visitorName,
      pass.type === "standard" ? pass.ownerCompany : pass.createdByCompany,
      pass.status,
      format(pass.expiresAt.toDate(), "PP"),
      pass.location,
      pass.createdByName,
      format(pass.createdAt.toDate(), "PP p"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `passes-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedCount} pass(es) to CSV.`,
    });
  };

  const handlePrintQRCodes = async () => {
    toast({
      title: "Generating PDF",
      description: "Creating QR codes PDF...",
    });

    try {
      // Dynamic import to reduce bundle size
      const { jsPDF } = await import("jspdf");
      const QRCode = (await import("qrcode")).default;

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = 60;
      const margin = 20;
      const cols = 2;
      const rows = 3;
      const spacing = 10;

      let currentPage = 0;
      let position = 0;

      for (const pass of selectedPasses) {
        if (position % (cols * rows) === 0 && position !== 0) {
          pdf.addPage();
          currentPage++;
        }

        const col = (position % cols);
        const row = Math.floor((position % (cols * rows)) / cols);
        
        const x = margin + col * (qrSize + spacing);
        const y = margin + row * (qrSize + spacing + 15);

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(pass.qrPayload, {
          width: 256,
          margin: 1,
        });

        // Add QR code
        pdf.addImage(qrDataUrl, "PNG", x, y, qrSize, qrSize);

        // Add plate number below QR
        pdf.setFontSize(10);
        pdf.text(`${pass.plateAlpha}-${pass.plateNum}`, x + qrSize / 2, y + qrSize + 5, { align: "center" });
        
        // Add expiry date
        pdf.setFontSize(8);
        pdf.text(`Expires: ${format(pass.expiresAt.toDate(), "PP")}`, x + qrSize / 2, y + qrSize + 10, { align: "center" });

        position++;
      }

      pdf.save(`qr-codes-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF Generated",
        description: `Created PDF with ${selectedCount} QR code(s).`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} pass(es) selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeDialog(true)}
              disabled={activePassCount === 0 || isProcessing}
            >
              <Ban className="mr-2 h-4 w-4" />
              Revoke ({activePassCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isProcessing}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintQRCodes}
              disabled={isProcessing}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print QR Codes
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Selected Passes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke {activePassCount} active pass(es). Expired and already-revoked passes will be skipped.
              This action can be undone by updating each pass individually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRevoke} disabled={isProcessing}>
              {isProcessing ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Passes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} pass(es). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
