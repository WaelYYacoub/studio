"use client";

import { MoreHorizontal, Check, X, Shield, User, Mail } from "lucide-react";
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
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { AppUser, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { sendApprovalEmail } from "@/lib/email";

interface UsersTableActionsProps {
  user: AppUser;
}

export function UsersTableActions({ user: targetUser }: UsersTableActionsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const handleRoleChange = async (newRole: Role) => {
    if (currentUser?.uid === targetUser.uid) {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: "You cannot change your own role."
        });
        return;
    }
    
    try {
      const userRef = doc(db, "users", targetUser.uid);
      
      // Update user role with approval metadata
      await updateDoc(userRef, { 
        role: newRole, 
        approvedBy: currentUser?.uid, 
        approvedAt: serverTimestamp() 
      });
      
      // Send email notification if user was approved from pending status
      if (targetUser.role === 'pending' && (newRole === 'user' || newRole === 'admin')) {
        // Send email asynchronously - don't wait for it
        sendApprovalEmail(
          targetUser.email,
          targetUser.fullName,
          newRole
        ).then((emailSent) => {
          if (emailSent) {
            console.log('✅ Approval email sent to:', targetUser.email);
          }
        }).catch((error) => {
          console.error('Email sending failed (non-critical):', error);
        });
      }
      
      // Show success message with different text based on action
      if (newRole === 'rejected') {
        toast({
          variant: "destructive",
          title: "User Rejected",
          description: `${targetUser.fullName}'s account has been rejected.`,
        });
      } else if (targetUser.role === 'pending') {
        toast({
          title: "✅ User Approved!",
          description: `${targetUser.fullName} has been approved as ${newRole}. They will receive an email notification.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Role Updated",
          description: `${targetUser.fullName}'s role has been changed to ${newRole}.`,
        });
      }
      
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
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
                    Approve as User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Approve as Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleRoleChange('rejected')} 
                  className="text-destructive focus:text-destructive"
                >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </DropdownMenuItem>
            </>
        )}
        {targetUser.role !== 'pending' && targetUser.role !== 'owner' && (
             <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    {targetUser.role === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                    <span>Change Role</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange('user')} 
                      disabled={targetUser.role === 'user'}
                    >
                        <User className="mr-2 h-4 w-4" />
                        User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange('admin')} 
                      disabled={targetUser.role === 'admin'}
                    >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange('rejected')}
                      className="text-destructive focus:text-destructive"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Revoke Access
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
             </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}