"use client";

import { ShieldCheck, QrCode } from 'lucide-react';
import ManualSearch from '@/components/verifier/manual-search';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/verifier/qr-scanner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PassDetails from '@/components/verifier/pass-details';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function VerifierPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedPass, setScannedPass] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    console.log("Processing scanned QR:", decodedText);
    setIsValidating(true);

    try {
      // Parse QR data
      const qrData = JSON.parse(decodedText);
      console.log("Parsed QR data:", qrData);

      // Validate QR structure
      if (!qrData.pid || !qrData.v) {
        throw new Error("Invalid QR code format");
      }

      // Fetch pass from Firestore using the pass ID
      const passRef = doc(db, 'passes', qrData.pid);
      const passSnap = await getDoc(passRef);

      if (!passSnap.exists()) {
        throw new Error("Pass not found");
      }

      const passData = passSnap.data();
      console.log("Pass data from Firestore:", passData);

      // Check expiry
      const now = Date.now() / 1000;
      if (qrData.exp && qrData.exp < now) {
        passData.expired = true;
      }

      // Close scanner and show result
      setIsScannerOpen(false);
      setScannedPass({ id: passSnap.id, ...passData });
    } catch (error: any) {
      console.error("Validation error:", error);
      alert(`Scan failed: ${error.message}`);
      setIsScannerOpen(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold">GuardianGate Verifier</span>
          </div>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Pass Verifier</h1>
            <p className="text-muted-foreground mt-2">
              Enter a vehicle's plate number or scan a QR code to verify its access status.
            </p>
          </div>

          {/* Show scan result */}
          {scannedPass && (
            <PassDetails pass={scannedPass} onClose={() => setScannedPass(null)} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Manual Plate Search</CardTitle>
              <CardDescription>Enter the plate letters and numbers separately.</CardDescription>
            </CardHeader>
            <CardContent>
              <ManualSearch />
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-secondary/30 px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" /> Scan QR Code
                </DialogTitle>
                <DialogDescription>
                  Use your device's camera to scan the pass QR code.
                </DialogDescription>
              </DialogHeader>
              {isValidating ? (
                <div className="text-center py-8">Validating pass...</div>
              ) : (
                <QrScanner 
                  onScanSuccess={handleScanSuccess}
                  onScanError={(error) => console.error("Scanner error:", error)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}