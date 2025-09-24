import type { ReactNode } from 'react';
import Image from 'next/image';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary p-3 text-primary-foreground">
                <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">GuardianGate</h1>
            <p className="mt-1 text-muted-foreground">Secure Access Management</p>
        </div>
        {children}
         <div className="mt-6 text-center">
          <Link href="/verifier" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ShieldAlert className="h-5 w-5" />
            <span>Pass Verifier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
