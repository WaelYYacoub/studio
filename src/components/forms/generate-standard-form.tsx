"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { buildQrPayload } from "@/lib/qr";
import { useState } from "react";
import PassPreviewDialog from "./pass-preview-dialog";
import type { StandardPass, Pass } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const formSchema = z.object({
  plateAlpha: z.string().min(1, "Required").max(4, "Max 4 chars").regex(/^[a-zA-Z]+$/, "Only letters allowed"),
  plateNum: z.string().min(1, "Required").max(5, "Max 5 digits").regex(/^\d+$/, "Only numbers"),
  ownerName: z.string().min(2, "Required"),
  serial: z.string().min(1, "Required"),
  ownerCompany: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  expiresAt: z.date({ required_error: "Expiry date is required." }),
});

const locations = ["SEC 01", "SEC 02", "SEC 03", "SEC 04", "SEC 05", "SEC 06", "SEC 07", "SEC 08", "SEC 09", "SEC 10", "LD 01", "LD 02", "LD 03", "LD 04", "LD 05", "LD 06", "Pump Station"];

export default function GenerateStandardForm() {
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<Pass | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateAlpha: "",
      plateNum: "",
      ownerName: "",
      serial: "",
      ownerCompany: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a pass." });
      return;
    }
    setIsSubmitting(true);

    try {
      const passCollection = collection(db, "passes").withConverter(passConverter);
      const newPassData: Omit<StandardPass, 'id' | 'qrPayload'> = {
        type: "standard",
        plateAlpha: values.plateAlpha.toUpperCase(),
        plateNum: values.plateNum,
        ownerName: values.ownerName,
        serial: values.serial,
        ownerCompany: values.ownerCompany,
        location: values.location,
        expiresAt: values.expiresAt,
        status: "active",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.fullName,
        createdByCompany: user.company,
      };

      const docRef = await addDoc(passCollection, newPassData as any); // Firestore will add id

      const finalPassData = {
        ...newPassData,
        id: docRef.id,
        qrPayload: buildQrPayload(docRef.id, values.plateAlpha, values.plateNum, values.expiresAt),
        createdAt: new Date(), // For preview
        expiresAt: values.expiresAt, // For preview
      };

      setGeneratedPass(finalPassData as Pass);
      toast({ title: "Success", description: "Standard pass created successfully." });
      form.reset();

    } catch (error) {
      console.error("Error creating pass:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create pass. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
              control={form.control}
              name="plateAlpha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Alpha</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC" {...field} style={{textTransform: 'uppercase'}}/>
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
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial</FormLabel>
                <FormControl>
                  <Input placeholder="SN-12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownerCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner's Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Location</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {locations.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Valid Until</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting || userLoading} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Pass
          </Button>
        </form>
      </Form>
      {generatedPass && (
        <PassPreviewDialog 
          pass={generatedPass} 
          open={!!generatedPass} 
          onOpenChange={() => setGeneratedPass(null)}
        />
      )}
    </>
  );
}
