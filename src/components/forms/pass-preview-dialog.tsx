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

interface PassPreviewDialogProps {
  pass: Pass;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PassPreviewDialog({ pass, open, onOpenChange }: PassPreviewDialogProps) {
  const { toast } = useToast();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify(pass.qrPayload))}`;

  const handlePrint = () => {
    const printContent = document.getElementById('print-area-dialog');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write(`<html><head><title>Print Pass</title>`);
        printWindow.document.write('<style>body { font-family: sans-serif; } .print-card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; max-width: 400px; margin: 20px auto; text-align: center; } h2 { text-align: center; } .details { display: grid; grid-template-columns: 100px 1fr; gap: 8px; text-align: left; } .qr-code-container { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-top: 16px; display: inline-flex; flex-direction: column; align-items: center; gap: 8px; } img { max-width: 150px; margin: auto; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  const handleDownload = async () => {
    try {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `qr-pass-${pass.plateAlpha}-${pass.plateNum}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({ title: "Success", description: "QR code downloaded." });
    } catch (error) {
        console.error("Download failed", error);
        toast({ variant: "destructive", title: "Error", description: "Could not download QR code." });
    }
  };

  const handleShare = async () => {
    const shareData = {
        title: 'Gate Pass',
        text: `Gate Pass for ${pass.plateAlpha}-${pass.plateNum}`,
        url: window.location.href, // Or a specific public URL for the pass if available
    };
    if (navigator.share && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            toast({ title: "Shared", description: "Pass details shared successfully." });
        } catch (error) {
            console.error('Share failed', error);
            toast({ variant: "destructive", title: "Error", description: "Could not share pass." });
        }
    } else {
        toast({ variant: "destructive", title: "Not Supported", description: "Web Share API is not supported in your browser." });
    }
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

        <div id="print-area-dialog" className="py-4">
             <div className="print-card text-center">
                 <h2 className="text-2xl font-bold font-headline text-center mb-4">
                    {pass.plateAlpha} {pass.plateNum}
                </h2>
                <div className="details grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm text-left">
                    <span className="font-semibold text-muted-foreground">Status:</span>
                    <span className="font-bold text-green-600 capitalize">{pass.status}</span>

                    <span className="font-semibold text-muted-foreground">Type:</span>
                    <span className="capitalize">{pass.type}</span>

                    {pass.type === "standard" && (
                        <>
                            <span className="font-semibold text-muted-foreground">Owner:</span>
                            <span>{pass.ownerName}</span>
                            <span className="font-semibold text-muted-foreground">Company:</span>
                            <span>{pass.ownerCompany}</span>
                        </>
                    )}

                    {pass.type === "visitor" && (
                         <>
                            <span className="font-semibold text-muted-foreground">Visitor:</span>
                            <span>{pass.visitorName}</span>
                            <span className="font-semibold text-muted-foreground">Purpose:</span>
                            <span>{pass.purpose}</span>
                        </>
                    )}

                    <span className="font-semibold text-muted-foreground">Expires:</span>
                    <span>{format(pass.expiresAt, "PPP, p")}</span>
                </div>

                <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-lg border p-4">
                    <QrCodeDisplay payload={pass.qrPayload} />
                    <p className="text-xs text-muted-foreground">{pass.plateAlpha}-{pass.plateNum}</p>
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
