import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Pass } from "@/types";
import { format } from "date-fns";
import QrCodeDisplay from "../ui/qr-code";
import { Share2, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef, useCallback } from "react";
import { toPng } from 'html-to-image';

interface PassPreviewDialogProps {
  pass: Pass;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PassPreviewDialog({ pass, open, onOpenChange }: PassPreviewDialogProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!pass.qrPayload) {
      toast({
        variant: "destructive",
        title: "No QR Code",
        description: "This pass does not have a QR code to print.",
      });
      return;
    }

    toast({
      title: "Generating PDF",
      description: "Creating pass card...",
    });

    try {
      // Dynamic imports
      const { jsPDF } = await import("jspdf");
      const QRCode = (await import("qrcode")).default;

      const pdf = new jsPDF();
      
      // Card dimensions - 3x3 layout
      const cardWidth = 55;
      const cardHeight = 70;
      const margin = 15;
      
      // Center single card on page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const x = (pageWidth - cardWidth) / 2;
      const y = (pageHeight - cardHeight) / 2;

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

      // Draw card border (rounded rectangle)
      pdf.setDrawColor(200, 200, 200); // Light gray border
      pdf.setLineWidth(0.5);
      pdf.setFillColor(255, 255, 255); // White background
      pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

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

      // Auto-print
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');

      toast({
        title: "Print Ready",
        description: "Pass card opened in new window.",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate print card.",
      });
    }
  };

  const exportCard = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        skipFonts: true,
        pixelRatio: 2,
        style: {
          background: "white",
          fontFamily: "sans-serif",
        },
        filter: (node) => {
          if (node.tagName === "STYLE" || node.tagName === "LINK") {
            return false;
          }
          return true;
        },
      });
    } catch (err) {
      console.error("Failed to export card:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not export pass card." });
      return null;
    }
  }, [cardRef, toast]);

  const handleDownload = useCallback(async () => {
    const dataUrl = await exportCard();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-pass-${pass.plateAlpha}-${pass.plateNum}.png`;
    link.href = dataUrl;
    link.click();
    toast({ title: "Success", description: "QR code card downloaded." });
  }, [exportCard, pass, toast]);

  const handleShare = async () => {
    const dataUrl = await exportCard();
    if (!dataUrl) return;

    try {
      const blob = await(await fetch(dataUrl)).blob();
      const file = new File([blob], `qr-pass-${pass.plateAlpha}-${pass.plateNum}.png`, { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
              title: 'Gate Pass',
              files: [file],
          });
          toast({ title: "Shared", description: "Pass details shared successfully." });
      } else {
        const win = window.open();
        if (win) {
            win.document.write(`<img src="${dataUrl}" alt="Pass QR Code" />`);
        } else {
            toast({ variant: "destructive", title: "Not Supported", description: "Web Share API for files is not supported in your browser." });
        }
      }
    } catch (error) {
        console.error('Share failed', error);
        toast({ variant: "destructive", title: "Error", description: "Could not share pass." });
    }
  };

  const getPassDate = (date: any): Date => {
    if (date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  // ✅ FIX: Determine status color based on pass status and expiry
  const getStatusColor = (): string => {
    const isExpired = getPassDate(pass.expiresAt) < new Date();
    
    if (pass.status === "active" && !isExpired) {
      return "text-green-600"; // Active and not expired
    }
    if (pass.status === "revoked") {
      return "text-red-600"; // Revoked
    }
    if (pass.status === "expired" || isExpired) {
      return "text-red-600"; // Expired
    }
    if (pass.status === "pending") {
      return "text-yellow-600"; // Pending
    }
    return "text-gray-600"; // Unknown status
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pass Generated Successfully</DialogTitle>
          <DialogDescription>
            Review the pass details below. You can print, share, or download the pass.
          </DialogDescription>
        </DialogHeader>

        <div id="print-area-dialog" ref={printRef} className="py-4">
          <div className="print-card text-center">
            <h2 className="text-2xl font-bold font-headline text-center mb-4">
              {pass.plateAlpha} {pass.plateNum}
            </h2>
            <div className="details grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm text-left">
              <span className="details-label font-semibold text-muted-foreground">Status:</span>
              <span className={`details-value font-bold capitalize ${getStatusColor()}`}>{pass.status}</span>

              <span className="details-label font-semibold text-muted-foreground">Type:</span>
              <span className="details-value capitalize">{pass.type}</span>

              {pass.type === "standard" && (
                <>
                  <span className="details-label font-semibold text-muted-foreground">Owner:</span>
                  <span className="details-value">{pass.ownerName}</span>
                  <span className="details-label font-semibold text-muted-foreground">Company:</span>
                  <span className="details-value">{pass.ownerCompany}</span>
                </>
              )}

              {pass.type === "visitor" && (
                <>
                  <span className="details-label font-semibold text-muted-foreground">Visitor:</span>
                  <span className="details-value">{pass.visitorName}</span>
                  <span className="details-label font-semibold text-muted-foreground">Purpose:</span>
                  <span className="details-value">{pass.purpose}</span>
                </>
              )}

              <span className="details-label font-semibold text-muted-foreground">Expires:</span>
              <span className="details-value" style={{textTransform: 'none'}}>{format(getPassDate(pass.expiresAt), "PPP, p")}</span>
            </div>

            <div ref={cardRef} className="mt-6 flex justify-center p-2">
              <QrCodeDisplay payload={pass.qrPayload} />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
