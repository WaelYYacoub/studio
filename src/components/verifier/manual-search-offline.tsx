"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { searchPassLocally } from "@/lib/local-db";
import type { Pass } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import PassDetails from "./pass-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const formSchema = z.object({
  plateAlpha: z.string().min(1, "Required").max(4, "Max 4 chars").regex(/^[a-zA-Z]+$/, "Only letters allowed"),
  plateNum: z.string().min(1, "Required").max(5, "Max 5 digits").regex(/^\d+$/, "Only numbers"),
});

export default function ManualSearchOffline() {
  const [isLoading, setIsLoading] = useState(false);
  const [passResult, setPassResult] = useState<Pass | "not_found" | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { plateAlpha: "", plateNum: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>)  {
    setIsLoading(true);
    setPassResult(null);

    try {
      console.log("[ManualSearch] Searching local database for:", values.plateAlpha, values.plateNum);
      
      // Search local IndexedDB database
      const passData = await searchPassLocally(
        values.plateAlpha.toUpperCase(),
        values.plateNum
      );

      if (!passData) {
        console.log("[ManualSearch] No pass found in local database");
        setPassResult("not_found");
      } else {
        console.log("[ManualSearch] Pass found:", passData.id);
        setPassResult(passData);
      }
    } catch (error) {
      console.error("Error searching for pass:", error);
      setPassResult("not_found");
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    form.reset();
    setPassResult(null);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plateAlpha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Alpha</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC" {...field} style={{textTransform: 'uppercase'}} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plateNum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
            <Button type="button" variant="destructive" onClick={handleReset} className="flex-1">
                Reset
            </Button>
          </div>
        </form>
      </Form>
      
      {isLoading && (
          <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>
      )}

      <Dialog open={!!passResult} onOpenChange={(open) => !open && setPassResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Result</DialogTitle>
            <DialogDescription>
              The access status for the pass is shown below.
            </DialogDescription>
          </DialogHeader>
          {passResult && <PassDetails pass={passResult} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
