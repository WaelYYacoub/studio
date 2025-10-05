import { UsersTable } from '@/components/tables/users-table';
import { Suspense } from 'react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          Approve new users and manage existing user roles.
        </p>
      </div>
      <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-lg bg-muted" />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
