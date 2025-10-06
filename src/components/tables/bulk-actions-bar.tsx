"use client";

import { Button } from "@/components/ui/button";
import { Ban, Trash2, FileSpreadsheet, Printer, X } from "lucide-react";
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
import * as XLSX from "xlsx";

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

  const handleExportExcel = async () => {
    const now = new Date();
    const exportDate = format(now, "PPpp");
    
    // Calculate statistics
    const statusCounts = {
      active: selectedPasses.filter(p => p.status === "active").length,
      expired: selectedPasses.filter(p => {
        const expiry = p.expiresAt.toDate();
        return expiry < now && p.status !== "revoked";
      }).length,
      revoked: selectedPasses.filter(p => p.status === "revoked").length,
    };

    const typeCounts = {
      standard: selectedPasses.filter(p => p.type === "standard").length,
      visitor: selectedPasses.filter(p => p.type === "visitor").length,
    };

    // Import xlsx-style for styling support
    const XLSX_STYLE = await import("xlsx-js-style");

    // Create workbook
    const wb = XLSX_STYLE.utils.book_new();

    // SHEET 1: SUMMARY with formatting
    const summaryData = [
      ["GUARDIAN GATE - PASS RECORDS REPORT", ""],
      ["", ""],
      ["Report Generated:", exportDate],
      ["Total Records:", selectedCount],
      ["", ""],
      ["SUMMARY STATISTICS", ""],
      ["", ""],
      ["Status Breakdown", "Count"],
      ["Active Passes", statusCounts.active],
      ["Expired Passes", statusCounts.expired],
      ["Revoked Passes", statusCounts.revoked],
      ["", ""],
      ["Type Breakdown", "Count"],
      ["Standard Passes", typeCounts.standard],
      ["Visitor Passes", typeCounts.visitor],
    ];

    const wsSummary = XLSX_STYLE.utils.aoa_to_sheet(summaryData);

    // Style summary sheet
    const titleStyle = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const labelStyle = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "D9E1F2" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const dataStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Apply title style
    wsSummary['A1'].s = titleStyle;
    wsSummary['B1'].s = titleStyle;

    // Apply styles to summary headers and data
    ['A6', 'B6'].forEach(cell => { if (wsSummary[cell]) wsSummary[cell].s = titleStyle; });
    ['A8', 'B8'].forEach(cell => { if (wsSummary[cell]) wsSummary[cell].s = headerStyle; });
    ['A13', 'B13'].forEach(cell => { if (wsSummary[cell]) wsSummary[cell].s = headerStyle; });
    
    // Apply styles to data rows
    [9, 10, 11, 14, 15].forEach(row => {
      ['A', 'B'].forEach(col => {
        const cell = `${col}${row}`;
        if (wsSummary[cell]) wsSummary[cell].s = col === 'A' ? labelStyle : dataStyle;
      });
    });

    // Set column widths
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
    wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // SHEET 2: DETAILED RECORDS with formatting
    const headers = [
      "No.",
      "Plate Number",
      "Pass Type",
      "Owner/Visitor",
      "Company",
      "Status",
      "Location",
      "Serial",
      "Issue Date",
      "Expiry Date",
      "Created By",
      "Pass ID"
    ];

    const rows = selectedPasses.map((pass, index) => [
      index + 1,
      `${pass.plateAlpha}-${pass.plateNum}`,
      pass.type.charAt(0).toUpperCase() + pass.type.slice(1),
      pass.type === "standard" ? pass.ownerName : pass.visitorName,
      pass.type === "standard" ? pass.ownerCompany : pass.createdByCompany,
      pass.status.toUpperCase(),
      pass.location,
      pass.type === "standard" ? pass.serial : "N/A",
      format(pass.createdAt.toDate(), "PP"),
      format(pass.expiresAt.toDate(), "PP"),
      pass.createdByName,
      pass.id,
    ]);

    const wsData = XLSX_STYLE.utils.aoa_to_sheet([headers, ...rows]);

    // Style header row
    const range = XLSX_STYLE.utils.decode_range(wsData['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX_STYLE.utils.encode_col(C) + "1";
      if (!wsData[address]) continue;
      wsData[address].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Style data rows with alternating colors and status color coding
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const isEvenRow = R % 2 === 0;
      const rowBgColor = isEvenRow ? "FFFFFF" : "F2F2F2";
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX_STYLE.utils.encode_col(C) + (R + 1).toString();
        if (!wsData[address]) continue;

        let cellStyle: any = {
          fill: { fgColor: { rgb: rowBgColor } },
          border: {
            top: { style: "thin", color: { rgb: "D3D3D3" } },
            bottom: { style: "thin", color: { rgb: "D3D3D3" } },
            left: { style: "thin", color: { rgb: "D3D3D3" } },
            right: { style: "thin", color: { rgb: "D3D3D3" } }
          },
          alignment: { vertical: "center" }
        };

        // Status column (index 5) - color code based on status
        if (C === 5) {
          const status = wsData[address].v;
          if (status === "ACTIVE") {
            cellStyle.fill = { fgColor: { rgb: "C6EFCE" } };
            cellStyle.font = { color: { rgb: "006100" }, bold: true };
          } else if (status === "EXPIRED") {
            cellStyle.fill = { fgColor: { rgb: "FFC7CE" } };
            cellStyle.font = { color: { rgb: "9C0006" }, bold: true };
          } else if (status === "REVOKED") {
            cellStyle.fill = { fgColor: { rgb: "FFC7CE" } };
            cellStyle.font = { color: { rgb: "9C0006" }, bold: true };
          }
        }

        wsData[address].s = cellStyle;
      }
    }

    // Set column widths
    wsData['!cols'] = [
      { wch: 6 },  { wch: 15 }, { wch: 12 }, { wch: 20 },
      { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }
    ];

    // Enable auto-filter
    wsData['!autofilter'] = { ref: `A1:L${rows.length + 1}` };

    // Add sheets to workbook
    XLSX_STYLE.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX_STYLE.utils.book_append_sheet(wb, wsData, "Detailed Records");

    // Generate file
    XLSX_STYLE.writeFile(wb, `Guardian-Gate-Report-${format(now, "yyyy-MM-dd-HHmm")}.xlsx`);

    toast({
      title: "Excel Report Generated",
      description: `Exported ${selectedCount} pass record(s) with formatting.`,
    });
  };

  const handlePrintQRCodes = async () => {
    // Filter passes that have valid QR payloads
    const validPasses = selectedPasses.filter(pass => {
      return pass.qrPayload && 
             pass.qrPayload !== '' && 
             pass.qrPayload !== null && 
             pass.qrPayload !== undefined;
    });
    
    if (validPasses.length === 0) {
      toast({
        variant: "destructive",
        title: "No Valid QR Codes",
        description: "Selected passes do not have QR codes generated.",
      });
      return;
    }

    if (validPasses.length < selectedPasses.length) {
      const skipped = selectedPasses.length - validPasses.length;
      toast({
        title: "Notice",
        description: `${skipped} pass(es) skipped - no QR code data available.`,
      });
    }

    toast({
      title: "Generating PDF",
      description: `Creating ${validPasses.length} pass card(s)...`,
    });

    try {
      const { jsPDF } = await import("jspdf");
      const QRCode = (await import("qrcode")).default;

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Card dimensions - 3x3 layout (9 cards per page)
      const cardWidth = 55;
      const cardHeight = 70;
      const margin = 15;
      const cols = 3;
      const rows = 3;
      const spacingX = (pageWidth - (2 * margin) - (cols * cardWidth)) / (cols - 1);
      const spacingY = (pageHeight - (2 * margin) - (rows * cardHeight)) / (rows - 1);

      let position = 0;

      for (const pass of validPasses) {
        if (position % (cols * rows) === 0 && position !== 0) {
          pdf.addPage();
        }

        const col = position % cols;
        const row = Math.floor((position % (cols * rows)) / cols);
        
        const x = margin + col * (cardWidth + spacingX);
        const y = margin + row * (cardHeight + spacingY);

        // Generate QR code with error handling
        try {
          // Convert qrPayload to string if it's an object
          let qrString = pass.qrPayload;
          if (typeof qrString === 'object') {
            qrString = JSON.stringify(qrString);
          }
          
          const qrDataUrl = await QRCode.toDataURL(qrString, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: 'M'
          });

          // Draw card border (rounded rectangle effect with thin border)
          pdf.setDrawColor(200, 200, 200); // Light gray border
          pdf.setLineWidth(0.5);
          pdf.setFillColor(255, 255, 255); // White background
          pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD'); // Filled and drawn with rounded corners

          // Add QR code (centered in upper portion of card)
          const qrSize = 35;
          const qrX = x + (cardWidth - qrSize) / 2;
          const qrY = y + 10;
          pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

          // Add plate number (centered below QR code)
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0); // Black text
          pdf.setFont(undefined, 'normal');
          pdf.text(`${pass.plateAlpha}-${pass.plateNum}`, x + cardWidth / 2, qrY + qrSize + 10, { align: 'center' });

          position++;
        } catch (qrError) {
          console.error(`Failed to generate QR for ${pass.plateAlpha}-${pass.plateNum}:`, qrError);
          // Skip this QR code and continue
        }
      }

      if (position === 0) {
        throw new Error("No valid QR codes could be generated");
      }

      pdf.save(`Guardian-Gate-Passes-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "PDF Generated",
        description: `Created PDF with ${position} pass card(s).`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5">
            <span className="text-sm font-semibold text-primary-foreground">
              {selectedCount} Selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowRevokeDialog(true)}
              disabled={activePassCount === 0 || isProcessing}
              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
            >
              <Ban className="mr-2 h-4 w-4" />
              Revoke ({activePassCount})
            </Button>
            <Button
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={handleExportExcel}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button
              size="sm"
              onClick={handlePrintQRCodes}
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print QR
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Selected Passes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke {activePassCount} active pass(es). Expired and already-revoked passes will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRevoke} disabled={isProcessing} className="bg-orange-500 hover:bg-orange-600">
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
