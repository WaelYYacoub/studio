"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, userConverter } from "@/lib/firestore";
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

export function UsersTable() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc")).withConverter(userConverter);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => doc.data())
        .filter(user => user.role !== 'owner'); // Exclude owner from list
      setUsers(usersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          {isLoading ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
            </TableRow>
          ) : users.length > 0 ? (
            users.map((user) => (
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
