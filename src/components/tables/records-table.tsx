"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  Query,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db, passConverter } from "@/lib/firestore";
import type { Pass, PassStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { RecordsTableActions } from "./records-table-actions";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function RecordsTable() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    company: "",
    status: "all",
    createdAt: undefined as Date | undefined,
    expiresAt: undefined as Date | undefined,
  });

  const fetchPasses = async (loadMore = false) => {
    if (loadMore) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const passesCollection = collection(db, "passes").withConverter(passConverter);
      
      const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

      if (filters.status !== 'all') {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters.company) {
        // This query requires a composite index on (ownerCompany, createdAt) and (createdByCompany, createdAt)
        // Firestore may not support 'OR' queries well. This is a simplification.
        // A better approach would be two separate queries or denormalizing company data.
         constraints.push(where("ownerCompany", "==", filters.company)); 
      }
       if (filters.createdAt) {
        constraints.push(where("createdAt", ">=", filters.createdAt));
      }
       if (filters.expiresAt) {
        constraints.push(where("expiresAt", "<=", filters.expiresAt));
      }

      if (loadMore && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      constraints.push(limit(PAGE_SIZE));

      const q = query(passesCollection, ...constraints);
      
      const documentSnapshots = await getDocs(q);

      const newPasses = documentSnapshots.docs.map(doc => doc.data());
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      setLastVisible(lastDoc);
      setHasMore(newPasses.length === PAGE_SIZE);
      
      if(loadMore) {
          setPasses(prev => [...prev, ...newPasses]);
      } else {
          setPasses(newPasses);
      }

    } catch (error) {
      console.error("Error fetching passes: ", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [filters]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
      setLastVisible(null);
      setFilters(prev => ({...prev, [key]: value}));
  }

  const getStatusVariant = (status: PassStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "revoked":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input 
                placeholder="Filter by company..."
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
            />
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.createdAt && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.createdAt ? format(filters.createdAt, "PPP") : <span>Created after...</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filters.createdAt} onSelect={(d) => handleFilterChange('createdAt', d)} initialFocus />
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("justify-start text-left font-normal", !filters.expiresAt && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.expiresAt ? format(filters.expiresAt, "PPP") : <span>Expires before...</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filters.expiresAt} onSelect={(d) => handleFilterChange('expiresAt', d)} initialFocus />
                </PopoverContent>
            </Popover>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Owner / Visitor</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : passes.length > 0 ? (
              passes.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-medium">
                    {pass.plateAlpha}-{pass.plateNum}
                  </TableCell>
                  <TableCell>
                    {pass.type === "standard" ? pass.ownerName : pass.visitorName}
                  </TableCell>
                  <TableCell>
                    {pass.type === "standard" ? pass.ownerCompany : pass.createdByCompany}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(pass.status)}>{pass.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(pass.expiresAt.toDate(), "PP")}
                  </TableCell>
                  <TableCell>
                    {format(pass.createdAt.toDate(), "PP")}
                  </TableCell>
                  <TableCell>
                    <RecordsTableActions pass={pass} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No passes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <div className="text-center">
          <Button onClick={() => fetchPasses(true)} disabled={isFetchingMore}>
            {isFetchingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Loading...</>
            ) : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
