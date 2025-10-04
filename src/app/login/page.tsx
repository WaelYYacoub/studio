"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Mail } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "1";

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        {isPending && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Account Pending Approval</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your account has been created successfully and is awaiting administrator approval. 
              You will receive an email notification once your account is activated.
            </AlertDescription>
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container flex h-screen w-screen flex-col items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}