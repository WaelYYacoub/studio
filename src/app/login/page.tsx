import { Suspense } from 'react';
import { LoginForm } from '@/components/forms/login-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function PendingAlert() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPending = params?.get('pending') === '1';

  if (!isPending) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-300">Awaiting Approval</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-400">
        Your account is pending approval from an administrator. You will be able to log in once your account has been approved.
      </AlertDescription>
    </Alert>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense>
        <PendingAlert />
      </Suspense>
      <LoginForm />
    </>
  );
}
