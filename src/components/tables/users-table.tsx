"use client";

import type { AppUser, Role } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UsersTableActions } from "./users-table-actions";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/data-provider";

export function UsersTable() {
  const { users, loading } = useData();
  const { user: currentUser } = useAuth();

  const getRoleVariant = (role: Role) => {
    switch (role) {
      case "owner":
      case "admin":
        return "default";
      case "user":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const displayUsers = users.filter(user => user.role !== 'owner');

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
            </TableRow>
          ) : displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)} className="capitalize">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  {currentUser?.uid !== user.uid && user.role !== 'owner' && (
                     <UsersTableActions user={user} />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
