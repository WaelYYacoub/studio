import { RecordsTable } from "@/components/tables/records-table";

export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">All Pass Records</h1>
        <p className="text-muted-foreground">
          Browse, search, and manage all existing gate passes.
        </p>
      </div>
      <RecordsTable />
    </div>
  );
}
