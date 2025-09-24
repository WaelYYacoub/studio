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

interface PassPreviewDialogProps {
  pass: Pass;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PassPreviewDialog({ pass, open, onOpenChange }: PassPreviewDialogProps) {

  const handlePrint = () => {
    const printContent = document.getElementById('print-area');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write(`<html><head><title>Print Pass</title>`);
        printWindow.document.write('<style>body { font-family: sans-serif; } .print-card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; max-width: 400px; margin: 20px auto; } h2 { text-align: center; } .details { display: grid; grid-template-columns: 100px 1fr; gap: 8px; } .qr-code { text-align: center; margin-top: 16px; } img { max-width: 150px; margin: auto; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pass Generated Successfully</DialogTitle>
          <DialogDescription>
            Review the pass details below. You can print it or share the QR code.
          </DialogDescription>
        </DialogHeader>

        <div id="print-area" className="py-4 space-y-4">
             <div className="print-card">
                 <h2 className="text-2xl font-bold font-headline text-center mb-4">
                    {pass.plateAlpha} {pass.plateNum}
                </h2>
                <div className="details grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
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

                <div className="qr-code mt-6 text-center">
                    <QrCodeDisplay payload={pass.qrPayload} />
                    <p className="text-xs text-muted-foreground mt-2">{pass.plateAlpha}-{pass.plateNum}</p>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
