"use client";

import { useState, useMemo } from "react";
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
import { useData } from "@/context/data-provider";
import { Checkbox } from "@/components/ui/checkbox";

const PAGE_SIZE = 10;

export function RecordsTable() {
  const { passes: allPasses, users, loading: dataLoading } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    company: "",
    status: "all",
    createdAt: undefined as Date | undefined,
    expiresAt: undefined as Date | undefined,
  });

  const filteredPasses = useMemo(() => {
    return allPasses.filter(pass => {
      if (filters.status !== 'all' && pass.status !== filters.status) return false;
      
      const companyMatch = pass.type === 'standard' ? pass.ownerCompany : pass.createdByCompany;
      if (filters.company && !companyMatch?.toLowerCase().includes(filters.company.toLowerCase())) return false;
      
      if (filters.createdAt && pass.createdAt.toDate() < filters.createdAt) return false;
      if (filters.expiresAt && pass.expiresAt.toDate() > filters.expiresAt) return false;

      return true;
    })
  }, [allPasses, filters]);

  const paginatedPasses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPasses.slice(start, end);
  }, [filteredPasses, currentPage]);
  
  const hasMore = useMemo(() => {
    return currentPage * PAGE_SIZE < filteredPasses.length;
  }, [currentPage, filteredPasses]);


  const handleFilterChange = (key: keyof typeof filters, value: any) => {
      setCurrentPage(1);
      setFilters(prev => ({...prev, [key]: value}));
  }
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    const newSelection: Record<string, boolean> = {};
    if (checked === true) {
      paginatedPasses.forEach(pass => {
        newSelection[pass.id] = true;
      });
    }
    setRowSelection(newSelection);
  };

  const handleRowSelect = (passId: string, checked: boolean | 'indeterminate') => {
    setRowSelection(prev => ({
      ...prev,
      [passId]: checked === true,
    }));
  };

  const isAllVisibleSelected = paginatedPasses.length > 0 && paginatedPasses.every(pass => rowSelection[pass.id]);

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
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllVisibleSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Owner / Visitor</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : paginatedPasses.length > 0 ? (
              paginatedPasses.map((pass) => {
                const creator = users.find(u => u.uid === pass.createdBy);
                return (
                  <TableRow key={pass.id} data-state={rowSelection[pass.id] && 'selected'}>
                    <TableCell>
                      <Checkbox
                        checked={rowSelection[pass.id] || false}
                        onCheckedChange={(checked) => handleRowSelect(pass.id, checked)}
                        aria-label="Select row"
                      />
                    </TableCell>
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
                      {creator?.fullName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <RecordsTableActions pass={pass} />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No passes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <div className="text-center">
          <Button onClick={() => setCurrentPage(p => p + 1)} >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
