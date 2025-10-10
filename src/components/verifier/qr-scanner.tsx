"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    const startScanner = async () => {
      try {
        setIsScanning(true);
        setError(null);
        
        // Initialize scanner
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);
        
        // Start scanning
        await scannerRef.current.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            console.log("QR Code scanned:", decodedText);
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore continuous scan errors
          }
        );
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to access camera";
        console.error("Scanner error:", errorMsg);
        setError(errorMsg);
        if (onScanError) onScanError(errorMsg);
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          // Check if scanner is running before trying to stop
          const state = scannerRef.current.getState();
          if (state === 2) { // 2 = SCANNING state in html5-qrcode
            scannerRef.current.stop()
              .then(() => console.log("Scanner stopped successfully"))
              .catch((err) => console.log("Scanner stop error (safe to ignore):", err));
          }
        } catch (err) {
          // Scanner might already be stopped or in invalid state - this is fine
          console.log("Scanner cleanup error (safe to ignore):", err);
        }
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="space-y-4">
      <div id={qrCodeRegionId} className="w-full" />
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p className="font-semibold">Camera Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Please allow camera access in your browser settings.</p>
        </div>
      )}
      {isScanning && !error && (
        <p className="text-center text-sm text-gray-600">
          Point your camera at the QR code
        </p>
      )}
    </div>
  );
}