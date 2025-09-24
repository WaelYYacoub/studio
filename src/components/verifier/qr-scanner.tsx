"use client";

import { useState, useRef, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import type { Pass } from "@/types";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, Video, VideoOff } from "lucide-react";
import PassDetails from "./pass-details";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsQR from "jsqr";

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
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop video stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    setIsLoading(true);
    setPassResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      requestAnimationFrame(tick);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings to use this feature.",
      });
      setIsScanning(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    setHasCameraPermission(null);
  };
  
  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          handleQrCode(code.data);
          return; // Stop scanning
        }
      }
    }
    if(isScanning) {
        requestAnimationFrame(tick);
    }
  };
  
  const handleQrCode = async (data: string) => {
    stopScan();
    setIsLoading(true);
    
    try {
      const parsedData = JSON.parse(data);
      const parsedPayload = qrPayloadSchema.safeParse(parsedData);
      
      if (!parsedPayload.success) {
        toast({ variant: "destructive", title: "Invalid QR Code", description: "The scanned QR code is not a valid pass." });
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
      toast({ variant: "destructive", title: "Verification Failed", description: "Could not verify the pass from the QR code." });
      setPassResult("not_found");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {!isScanning ? (
        <div className="flex justify-center">
            <Button onClick={startScan} disabled={isLoading} size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <QrCode className="mr-2 h-4 w-4" />
            )}
            QR Code Scanner
            </Button>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-black">
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-dashed border-primary/80 rounded-lg animate-pulse"></div>
                </div>
            </div>
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to use this feature. You may need to refresh the page and grant permission.
                </AlertDescription>
                </Alert>
            )}
            <Button onClick={stopScan} variant="destructive" className="w-full">
                Cancel Scan
            </Button>
        </div>
      )}

      {isLoading && !isScanning && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
