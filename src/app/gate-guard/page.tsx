"use client";

import { ShieldCheck, QrCode, Download, WifiOff, Wifi, RefreshCw } from 'lucide-react';
import ManualSearch from '@/components/verifier/manual-search-offline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QrScanner from '@/components/verifier/qr-scanner';
import { Button } from '@/components/ui/button';
import PassDetails from '@/components/verifier/pass-details';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { getPassById } from '@/lib/local-db';
import { initializeSyncManager, syncPassesFromFirebase, hasLocalData } from '@/lib/sync-manager';

export default function GateGuardPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedPass, setScannedPass] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  // Network and sync state
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState(0);
  const [hasData, setHasData] = useState(false);

  // Initialize sync manager and check for local data
  useEffect(() => {
    // Check if we have local data
    hasLocalData().then(has Data => {
      setHasData(hasData);
      if (!hasData && navigator.onLine) {
        // No local data and we're online, perform initial sync
        handleManualSync();
      }
    });

    // Initialize automatic syncing when online/offline
    initializeSyncManager((result) => {
      if (result.success) {
        setLastSyncCount(result.passCount);
        setHasData(true);
      }
      setIsSyncing(false);
    });

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events to update UI
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      alert('Cannot sync while offline. Please connect to the internet and try again.');
      return;
    }

    setIsSyncing(true);
    const result = await syncPassesFromFirebase();
    
    if (result.success) {
      setLastSyncCount(result.passCount);
      setHasData(true);
      alert(`Successfully synced ${result.passCount} passes from the server.`);
    } else {
      alert(`Sync failed: ${result.error}`);
    }
    
    setIsSyncing(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isValidating || scannedPass) return;

    console.log("Processing scanned QR:", decodedText);
    setIsValidating(true);
    setIsScannerOpen(false);

    try {
      // Parse QR data
      const qrData = JSON.parse(decodedText);
      console.log("Parsed QR data:", qrData);

      if (!qrData.pid || !qrData.v) {
        throw new Error("Invalid QR code format");
      }

      // Always try local database first, even if online
      console.log("Searching local database for pass:", qrData.pid);
      const passData = await getPassById(qrData.pid);

      if (!passData) {
        throw new Error("Pass not found in local database");
      }

      // Check QR expiration
      const now = Date.now() / 1000;
      if (qrData.exp && qrData.exp < now) {
        passData.expired = true;
      }

      // Show result
      setScannedPass({ id: qrData.pid, ...passData });
    } catch (error: any) {
      console.error("Validation error:", error);
      alert(`Scan failed: ${error.message}`);
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
            <span className="font-headline text-xl font-bold">Guardian Gate Guard</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Network status indicator */}
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Sync button */}
            {isOnline && (
              <Button 
                onClick={handleManualSync} 
                size="sm" 
                variant="outline"
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </Button>
            )}

            {/* Install button */}
            {showInstallButton && (
              <Button onClick={handleInstallClick} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Install</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Pass Verifier</h1>
            <p className="text-muted-foreground mt-2">
              Enter a vehicle's plate number or scan a QR code to verify its access status.
            </p>
            {!hasData && (
              <p className="text-orange-600 mt-2 text-sm">
                No passes stored locally. {isOnline ? 'Click Sync to download pass database.' : 'Connect to internet to download pass database.'}
              </p>
            )}
            {hasData && lastSyncCount > 0 && (
              <p className="text-green-600 mt-2 text-sm">
                {lastSyncCount} passes available offline
              </p>
            )}
          </div>

          {/* Show scan result in dialog */}
          <Dialog open={!!scannedPass} onOpenChange={(open) => !open && setScannedPass(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Verification Result</DialogTitle>
                <DialogDescription>Pass validation complete</DialogDescription>
              </DialogHeader>
              {scannedPass && <PassDetails pass={scannedPass} />}
            </DialogContent>
          </Dialog>

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
