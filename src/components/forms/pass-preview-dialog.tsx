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

  const handlePrint = () => {
    const printContent = document.getElementById('print-area-dialog');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write(`<html><head><title>Print Pass</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        `);
        printWindow.document.write('<style>body { font-family: "Inter", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .print-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; max-width: 400px; margin: 20px auto; text-align: center; background-color: #fff; } h2 { font-family: "Space Grotesk", sans-serif; font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1rem; color: #111827; } .details { display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem 1rem; text-align: left; font-size: 0.875rem; } .details-label { font-weight: 600; color: #6b7280; } .details-value { text-transform: capitalize; } .details-value.status-active { color: #16a34a; font-weight: 700; } .qr-container { margin-top: 1.5rem; display: inline-flex; flex-direction: column; align-items: center; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid #f3f4f6; padding: 1rem; } .qr-plate { font-size: 0.75rem; color: #6b7280; } img { max-width: 150px; margin: auto; border-radius: 0.5rem; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  const exportCard = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        skipFonts: true,
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
      console.error("❌ Failed to export card:", err);
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
  }, [exportCard, pass]);


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
    if (date.toDate) { // It's a Firestore Timestamp
      return date.toDate();
    }
    return new Date(date); // It's likely already a Date or a string
  }

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
                    <span className="details-value status-active font-bold text-green-600 capitalize">{pass.status}</span>

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

                <div ref={cardRef} className="qr-container mt-6 inline-flex flex-col items-center gap-2 rounded-lg border p-4 bg-white">
                    <QrCodeDisplay payload={pass.qrPayload} />
                    <p className="qr-plate text-xs text-muted-foreground">{pass.plateAlpha}-{pass.plateNum}</p>
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
