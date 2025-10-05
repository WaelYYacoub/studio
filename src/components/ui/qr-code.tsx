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

        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
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

  const plateNumber = payload?.pa && payload?.pn 
    ? `${payload.pa.toUpperCase()}-${payload.pn}` 
    : null;

  return (
    <div className="inline-flex flex-col items-center gap-4 p-6 bg-white border-[3px] border-gray-300 rounded-xl shadow-sm">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="rounded-sm"
      />
      {plateNumber && (
        <div className="font-mono font-semibold text-xl tracking-widest text-gray-800">
          {plateNumber}
        </div>
      )}
    </div>
  );
}