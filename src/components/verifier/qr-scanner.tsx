"use client";

import { useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import type { Pass } from "@/types";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import PassDetails from "./pass-details";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const qrPayloadSchema = z.object({
  v: z.number(),
  pid: z.string(),
  pa: z.string(),
  pn: z.string(),
  exp: z.number(),
});

export default function QrScanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [passResult, setPassResult] = useState<Pass | "not_found" | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    // This is a placeholder for a real QR scanner implementation
    // A real implementation would use the device's camera.
    // We simulate a scan result for demonstration purposes.
    toast({
      title: "QR Scanner Not Available",
      description: "This is a placeholder. A real QR scanner would use your camera. Simulating a scan...",
    });

    setIsLoading(true);
    setPassResult(null);

    // Simulate scanning a QR code with a valid payload
    // In a real scenario, you'd get this from a QR library
    const fakePayload = {
      v: 1,
      pid: "enter_a_real_pass_id_from_your_firestore_db",
      pa: "ABC",
      pn: "1234",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    
    setTimeout(async () => {
        try {
            const parsedPayload = qrPayloadSchema.safeParse(fakePayload);
            if (!parsedPayload.success) {
                setPassResult("not_found");
                return;
            }
            
            const passRef = doc(db, "passes", parsedPayload.data.pid).withConverter(passConverter);
            const docSnap = await getDoc(passRef);
            
            if (docSnap.exists() && docSnap.data().status === 'active' && docSnap.data().expiresAt.toDate() > new Date()) {
                setPassResult(docSnap.data());
            } else {
                setPassResult("not_found");
            }
        } catch (error) {
            console.error("Error verifying QR pass:", error);
            setPassResult("not_found");
        } finally {
            setIsLoading(false);
        }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button onClick={handleScan} disabled={isLoading} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <QrCode className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Scanning..." : "Simulate QR Scan"}
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
      )}

      <Dialog open={!!passResult} onOpenChange={(open) => !open && setPassResult(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verification Result</DialogTitle>
                <DialogDescription>
                The access status for the scanned pass is shown below.
                </DialogDescription>
            </DialogHeader>
            {passResult && <PassDetails pass={passResult} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
