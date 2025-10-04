"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QrCodeDisplayProps {
  payload: object;
  size?: number;
}

export default function QrCodeDisplay({ payload, size = 200 }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;
      
      try {
        // Convert payload to JSON string (NO URL encoding)
        const qrData = JSON.stringify(payload);
        
        console.log("Generating QR with data:", qrData);
        
        // Generate QR code directly on canvas
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        
        console.log("✓ QR code generated successfully");
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQR();
  }, [payload, size]);

  return <canvas ref={canvasRef} className="mx-auto rounded-lg" />;
}