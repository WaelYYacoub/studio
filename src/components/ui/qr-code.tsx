"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QrCodeDisplayProps {
  payload: any;
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

        const qrData = JSON.stringify(payload);
        console.log("Generating QR with data:", qrData);

        // Generate QR code with larger margin for cleaner look
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2, // Increased margin for cleaner appearance
          errorCorrectionLevel: 'M',
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        console.log("✓ QR code generated successfully");
      } catch (err) {
        console.error("Error generating QR code:", err);
        
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

  // Extract plate number from payload
  const plateNumber = payload?.pa && payload?.pn 
    ? `${payload.pa.toUpperCase()}-${payload.pn}` 
    : null;

  return (
    <div className="inline-flex flex-col items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="rounded-md"
      />
      {plateNumber && (
        <div className="text-center font-mono font-bold text-lg tracking-wider text-gray-800">
          {plateNumber}
        </div>
      )}
    </div>
  );
}