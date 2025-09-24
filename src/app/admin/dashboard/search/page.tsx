import ManualSearch from "@/components/verifier/manual-search";

export default function SearchPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">Pass Search</h1>
        <p className="text-muted-foreground">
          Quickly find a pass by its plate number.
        </p>
      </div>
      <ManualSearch isAdminSearch={true} />
    </div>
  );
}
