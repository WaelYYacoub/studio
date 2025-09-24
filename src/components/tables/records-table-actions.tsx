"use client";

import { MoreHorizontal, Ban, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { Pass } from "@/types";
import { useToast } from "@/hooks/use-toast";
import RoleGate from "../auth/role-gate";
import { useState } from "react";
import PassPreviewDialog from "../forms/pass-preview-dialog";

interface RecordsTableActionsProps {
  pass: Pass;
}

export function RecordsTableActions({ pass }: RecordsTableActionsProps) {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  const handleRevoke = async () => {
    if (pass.status === "revoked") return;
    try {
      const passRef = doc(db, "passes", pass.id);
      await updateDoc(passRef, { status: "revoked" });
      toast({
        title: "Pass Revoked",
        description: `Pass for plate ${pass.plateAlpha}-${pass.plateNum} has been revoked.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke pass.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "passes", pass.id));
      toast({
        title: "Pass Deleted",
        description: `Pass for plate ${pass.plateAlpha}-${pass.plateNum} has been permanently deleted.`,
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pass.",
      });
    }
  };


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <RoleGate allowedRoles={["admin", "owner"]}>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRevoke} disabled={pass.status === 'revoked'} className="text-orange-600 focus:text-orange-600">
              <Ban className="mr-2 h-4 w-4" />
              Revoke
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </RoleGate>
        </DropdownMenuContent>
      </DropdownMenu>
      {showPreview && (
        <PassPreviewDialog pass={pass} open={showPreview} onOpenChange={setShowPreview} />
      )}
    </>
  );
}
