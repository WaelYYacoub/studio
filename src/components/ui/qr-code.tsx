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
        // SAFETY CHECK: Ensure payload exists and is valid
        if (!payload || Object.keys(payload).length === 0) {
          console.error("QR payload is empty or undefined:", payload);
          
          // Display error message on canvas
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Data Missing', size / 2, size / 2 - 10);
            ctx.fillText('Recreate this pass', size / 2, size / 2 + 10);
          }
          return;
        }

        // Convert payload to JSON string
        const qrData = JSON.stringify(payload);
        console.log("Generating QR with data:", qrData);
        console.log("Payload keys:", Object.keys(payload));

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
        
        // Display error on canvas
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.fillStyle = '#ffe0e0';
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = '#cc0000';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Generation Failed', size / 2, size / 2);
        }
      }
    };

    generateQR();
  }, [payload, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="mx-auto rounded-lg" />;
}