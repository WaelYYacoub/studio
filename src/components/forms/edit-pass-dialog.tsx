"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Pass } from "@/types";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { LOCATIONS } from "@/lib/constants";

interface EditPassDialogProps {
  pass: Pass;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPassDialog({ pass, open, onOpenChange }: EditPassDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [location, setLocation] = useState(pass.location);
  const [expiresAt, setExpiresAt] = useState<Date>(
    pass.expiresAt.toDate ? pass.expiresAt.toDate() : new Date(pass.expiresAt)
  );
  const [status, setStatus] = useState(pass.status);
  
  // Standard pass fields
  const [ownerName, setOwnerName] = useState(pass.type === "standard" ? pass.ownerName : "");
  const [serial, setSerial] = useState(pass.type === "standard" ? pass.serial || "" : "");
  const [ownerCompany, setOwnerCompany] = useState(pass.type === "standard" ? pass.ownerCompany : "");
  
  // Visitor pass fields
  const [visitorName, setVisitorName] = useState(pass.type === "visitor" ? pass.visitorName : "");
  const [purpose, setPurpose] = useState(pass.type === "visitor" ? pass.purpose || "" : "");

  // Reset form when pass changes
  useEffect(() => {
    if (open) {
      setLocation(pass.location);
      setExpiresAt(pass.expiresAt.toDate ? pass.expiresAt.toDate() : new Date(pass.expiresAt));
      setStatus(pass.status);
      
      if (pass.type === "standard") {
        setOwnerName(pass.ownerName);
        setSerial(pass.serial || "");
        setOwnerCompany(pass.ownerCompany);
      } else if (pass.type === "visitor") {
        setVisitorName(pass.visitorName);
        setPurpose(pass.purpose || "");
      }
    }
  }, [pass, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const passRef = doc(db, "passes", pass.id);
      
      // Base update data
      const updateData: any = {
        location,
        expiresAt: Timestamp.fromDate(expiresAt),
        status,
        updatedAt: Timestamp.now(),
      };

      // Add type-specific fields
      if (pass.type === "standard") {
        updateData.ownerName = ownerName;
        updateData.serial = serial;
        updateData.ownerCompany = ownerCompany;
      } else if (pass.type === "visitor") {
        updateData.visitorName = visitorName;
        updateData.purpose = purpose;
      }

      await updateDoc(passRef, updateData);

      toast({
        title: "Pass Updated",
        description: `Pass for ${pass.plateAlpha}-${pass.plateNum} has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pass:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update pass. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pass</DialogTitle>
          <DialogDescription>
            Update pass details for {pass.plateAlpha}-{pass.plateNum}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Plate Number</Label>
              <p className="font-mono font-bold">{pass.plateAlpha}-{pass.plateNum}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="capitalize">{pass.type}</p>
            </div>
          </div>

          {/* Type-specific editable fields */}
          {pass.type === "standard" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="S001 (Optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerCompany">Company *</Label>
                <Input
                  id="ownerCompany"
                  value={ownerCompany}
                  onChange={(e) => setOwnerCompany(e.target.value)}
                  placeholder="ACME Corporation"
                  required
                />
              </div>
            </>
          )}

          {pass.type === "visitor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="visitorName">Visitor Name *</Label>
                <Input
                  id="visitorName"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Meeting with HR"
                />
              </div>
            </>
          )}

          {/* Common editable fields */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expires At *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={(date) => date && setExpiresAt(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)} required>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
