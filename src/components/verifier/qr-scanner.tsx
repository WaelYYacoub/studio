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
    let mounted = true;
    
    const startScanner = async () => {
      try {
        setIsScanning(true);
        setError(null);
        
        // Initialize scanner
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);
        
        // Start scanning
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (mounted) {
              console.log("QR Code scanned:", decodedText);
              onScanSuccess(decodedText);
            }
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

    // Cleanup
    return () => {
      mounted = false;
      
      // Delay stop to allow React to finish unmounting
      setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.stop()
            .then(() => console.log("Scanner stopped"))
            .catch(() => {}); // Silently ignore all errors
        }
      }, 100);
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