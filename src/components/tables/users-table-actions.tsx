"use client";

import { MoreHorizontal, Check, X, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { AppUser, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface UsersTableActionsProps {
  user: AppUser;
}

export function UsersTableActions({ user: targetUser }: UsersTableActionsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const handleRoleChange = async (newRole: Role) => {
    if (currentUser?.uid === targetUser.uid) {
        toast({ variant: "destructive", title: "Error", description: "You cannot change your own role."});
        return;
    }
    
    try {
      const userRef = doc(db, "users", targetUser.uid);
      await updateDoc(userRef, { role: newRole, approvedBy: currentUser?.uid, approvedAt: new Date() });
      toast({
        title: "User Role Updated",
        description: `${targetUser.fullName}'s role has been set to ${newRole}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {targetUser.role === "pending" && (
            <>
                <DropdownMenuItem onClick={() => handleRoleChange('user')}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('rejected')} className="text-destructive focus:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </DropdownMenuItem>
            </>
        )}
        {targetUser.role !== 'pending' && targetUser.role !== 'owner' && (
             <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    {targetUser.role === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                    <span>Set Role</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleRoleChange('user')} disabled={targetUser.role === 'user'}>
                        <User className="mr-2 h-4 w-4" />
                        User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('admin')} disabled={targetUser.role === 'admin'}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
             </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
