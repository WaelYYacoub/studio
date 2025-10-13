"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, ShieldQuestion } from "lucide-react";
import type { Pass } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect } from "react";

interface PassDetailsProps {
  pass: Pass | "not_found";
  isAdminSearch?: boolean;
}

// Helper function to convert various date formats to JavaScript Date
function getDateFromField(dateField: any): Date {
  // If it's a Firebase Timestamp with toDate method
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  // If it's already a Date object
  if (dateField instanceof Date) {
    return dateField;
  }
  // If it's an ISO string
  if (typeof dateField === 'string') {
    return new Date(dateField);
  }
  // If it's a timestamp number
  if (typeof dateField === 'number') {
    return new Date(dateField);
  }
  // Fallback to current date
  return new Date();
}

export default function PassDetails({ pass, isAdminSearch = false }: PassDetailsProps) {
  const isPassObject = pass !== "not_found";
  const isExpired = isPassObject && getDateFromField(pass.expiresAt) < new Date();
  const isAllowed = isPassObject && pass.status === "active" && !isExpired;

  useEffect(() => {
    if (isAdminSearch) return;

    let audio: HTMLAudioElement | null = null;
    let isCleaningUp = false;

    if (isPassObject) {
      audio = new Audio(isAllowed ? '/success.mp3' : '/denied.mp3');
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
          })
          .catch(error => {
            // Silently handle autoplay restrictions
            if (error.name !== 'AbortError') {
              console.log("Audio playback blocked by browser");
            }
          });
      }
    }

    return () => {
      isCleaningUp = true;
      if (audio) {
        audio.pause();
        audio.src = ''; // Release resources
        audio = null;
      }
    };
  }, [pass, isAllowed, isAdminSearch, isPassObject]);

  if (pass === "not_found") {
    return (
      <Card className="border-red-500 bg-red-50 dark:bg-red-950/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-red-700 dark:text-red-400">Pass Not Found</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400/80">
                No active pass found for this plate number. Please check the details and try again.
              </CardDescription>
            </div>
            {!isAdminSearch && <Image src="/Closing Gate.gif" alt="Access Denied" width={96} height={96} unoptimized />}
          </div>
        </CardHeader>
      </Card>
    );
  }
  
  if (!isAdminSearch && !isAllowed) {
    return (
      <Card className="border-red-500 bg-red-50 dark:bg-red-950/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-red-700 dark:text-red-400">Access Denied</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400/80">
                This pass is not currently active or has expired.
              </CardDescription>
            </div>
            {!isAdminSearch && <Image src="/Closing Gate.gif" alt="Access Denied" width={96} height={96} unoptimized />}
          </div>
        </CardHeader>
      </Card>
    );
  }

  const getStatusInfo = () => {
    if (isAllowed) {
      return { variant: "default", icon: CheckCircle2, title: "Access Granted", message: "This pass is valid for entry." };
    }
    if (isExpired || pass.status === "expired") {
      return { variant: "destructive", icon: Clock, title: "Access Denied: Expired", message: "This pass has expired." };
    }
    if (pass.status === "revoked") {
      return { variant: "destructive", icon: XCircle, title: "Access Denied: Revoked", message: "This pass has been revoked." };
    }
    return { variant: "destructive", icon: ShieldQuestion, title: "Status Unknown", message: "Pass status could not be determined." };
  }

  const statusInfo = getStatusInfo();
  
  // ✅ FIX: Determine if pass should show red (not allowed, expired, or revoked)
  const shouldShowRed = !isAllowed || isExpired || pass.status === "expired" || pass.status === "revoked";

  return (
    <Card className={shouldShowRed ? "border-red-500 bg-red-50 dark:bg-red-950/50" : "border-green-500 bg-green-50 dark:bg-green-950/50"}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className={shouldShowRed ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>{statusInfo.title}</CardTitle>
            <CardDescription className={shouldShowRed ? 'text-red-600 dark:text-red-400/80' : 'text-green-600 dark:text-green-400/80'}>{statusInfo.message}</CardDescription>
          </div>
          {!isAdminSearch && isAllowed && (
            <Image src="/Opening Gate.gif" alt="Access Granted" width={96} height={96} unoptimized />
          )}
          {!isAdminSearch && shouldShowRed && (
            <Image src="/Closing Gate.gif" alt="Access Denied" width={96} height={96} unoptimized />
          )}
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
            <span>{format(getDateFromField(pass.expiresAt), "PPP p")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
