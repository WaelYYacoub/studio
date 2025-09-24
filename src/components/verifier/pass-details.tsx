"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, ShieldQuestion, Share2, Download } from "lucide-react";
import type { Pass } from "@/types";
import { format } from "date-fns";
import QrCodeDisplay from "../ui/qr-code";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRef, useCallback } from "react";
import { toPng } from 'html-to-image';


interface PassDetailsProps {
  pass: Pass | "not_found";
  isAdminSearch?: boolean;
}

export default function PassDetails({ pass, isAdminSearch = false }: PassDetailsProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  if (pass === "not_found") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Pass Not Found</AlertTitle>
        <AlertDescription>
          No active pass found for this plate number. Please check the details and try again.
        </AlertDescription>
      </Alert>
    );
  }
  
  const isExpired = pass.expiresAt.toDate() < new Date();
  const isAllowed = pass.status === "active" && !isExpired;
  
  // For public verifier, only show allowed/denied. Admin sees all statuses.
  if (!isAdminSearch && !isAllowed) {
     return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          This pass is not currently active or has expired.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusInfo = () => {
    if (isAllowed) {
        return { variant: "default", icon: CheckCircle2, title: "Access Granted", message: "This pass is valid for entry." };
    }
    if (isExpired) {
        return { variant: "destructive", icon: Clock, title: "Access Denied: Expired", message: "This pass has expired." };
    }
    if (pass.status === "revoked") {
        return { variant: "destructive", icon: XCircle, title: "Access Denied: Revoked", message: "This pass has been revoked." };
    }
    return { variant: "destructive", icon: ShieldQuestion, title: "Status Unknown", message: "Pass status could not be determined." };
  }

  const statusInfo = getStatusInfo();

   const handleDownload = useCallback(() => {
    if (cardRef.current === null) {
      return;
    }

    toPng(cardRef.current, { cacheBust: true, backgroundColor: '#ffffff', style: { borderRadius: '0', boxShadow: 'none' } })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `qr-pass-${pass.plateAlpha}-${pass.plateNum}.png`;
        link.href = dataUrl;
        link.click();
        toast({ title: "Success", description: "QR code card downloaded." });
      })
      .catch((err) => {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Could not download QR code card." });
      });
  }, [cardRef, pass, toast]);

  const handleShare = async () => {
    const shareData = {
        title: 'Gate Pass',
        text: `Gate Pass for ${pass.plateAlpha}-${pass.plateNum}`,
        url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            toast({ title: "Shared", description: "Pass details shared successfully." });
        } catch (error) {
            console.error('Share failed', error);
            toast({ variant: "destructive", title: "Error", description: "Could not share pass." });
        }
    } else {
        toast({ variant: "destructive", title: "Not Supported", description: "Web Share API is not supported in your browser." });
    }
  };


  return (
    <Card className={isAllowed ? "border-green-500" : "border-red-500"}>
       <CardHeader>
        <div className="flex items-center gap-3">
            <statusInfo.icon className={`h-8 w-8 ${isAllowed ? 'text-green-600' : 'text-red-600'}`} />
            <div>
                 <CardTitle className={isAllowed ? 'text-green-700' : 'text-red-700'}>{statusInfo.title}</CardTitle>
                 <CardDescription>{statusInfo.message}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Plate:</span>
                <span className="font-mono font-bold">{pass.plateAlpha}-{pass.plateNum}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Type:</span>
                <span className="capitalize">{pass.type}</span>
            </div>
            {pass.type === "standard" && (
                <>
                    <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground">Owner:</span>
                        <span>{pass.ownerName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground">Company:</span>
                        <span>{pass.ownerCompany}</span>
                    </div>
                </>
            )}
            {pass.type === "visitor" && (
                <>
                     <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground">Visitor:</span>
                        <span>{pass.visitorName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-muted-foreground">Purpose:</span>
                        <span>{pass.purpose}</span>
                    </div>
                </>
            )}
             <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Location:</span>
                <span>{pass.location}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Expires At:</span>
                <span>{format(pass.expiresAt.toDate(), "PPP p")}</span>
            </div>
        </div>
        <Separator />
         <div className="text-center">
            <div className="inline-flex flex-col items-center gap-4">
                <div ref={cardRef} className="inline-flex flex-col items-center gap-2 rounded-lg border bg-white p-4">
                    <QrCodeDisplay payload={pass.qrPayload} />
                    <p className="text-xs text-muted-foreground">{pass.plateAlpha}-{pass.plateNum}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
