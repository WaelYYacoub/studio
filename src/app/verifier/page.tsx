"use client";

import { ShieldCheck, QrCode } from 'lucide-react';
import ManualSearch from '@/components/verifier/manual-search';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/verifier/qr-scanner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from 'react';

export default function VerifierPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
            <p className="text-muted-foreground mt-2">Enter a vehicle's plate number or scan a QR code to verify its access status.</p>
          </div>
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
                    <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5"/> Scan QR Code</DialogTitle>
                    <DialogDescription>Use your device's camera to scan the pass QR code.</DialogDescription>
                </DialogHeader>
                <QrScanner isOpen={isScannerOpen} onScanSuccess={() => setIsScannerOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
