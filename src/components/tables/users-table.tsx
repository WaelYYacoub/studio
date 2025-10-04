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

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case "pending":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200";
      case "user":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200";
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200";
      case "rejected":
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
                  <Badge className={`capitalize ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </Badge>
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