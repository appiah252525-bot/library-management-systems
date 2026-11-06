"use client";

import * as React from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, BookOpen, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface RecentBorrowRecord {
  id: string;
  student: {
    fullName: string;
    studentNumber: string;
    department: string;
  };
  book: {
    title: string;
    isbn: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  fine?: {
    amount: number;
    paidStatus: "UNPAID" | "PAID";
  } | null;
}

interface RecentBorrowingsTableProps {
  records: RecentBorrowRecord[];
  onRefresh?: () => void;
}

export function RecentBorrowingsTable({ records }: RecentBorrowingsTableProps) {
  const getStatusBadge = (status: "BORROWED" | "RETURNED" | "OVERDUE", fine?: any) => {
    switch (status) {
      case "BORROWED":
        return (
          <Badge variant="default" className="gap-1">
            <Clock className="h-3 w-3" /> Active
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Returned
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground">Recent Circulation Activity</h3>
          <p className="text-xs text-muted-foreground">Latest books checked out, returned, or flagged overdue</p>
        </div>
        <Link href="/borrowings">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            View All <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-3">Book Title</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Issued Date</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Fine Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y border-border divide-border">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-xs">
                  No circulation records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <span className="line-clamp-1 max-w-xs">{r.book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs">{r.student.fullName}</span>
                      <span className="text-[11px] text-muted-foreground">{r.student.studentNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {formatDate(r.borrowDate)}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                    {formatDate(r.dueDate)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(r.status, r.fine)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {r.fine ? (
                      <span className={r.fine.paidStatus === "PAID" ? "text-emerald-600 font-medium" : "text-rose-600 font-bold"}>
                        {formatCurrency(r.fine.amount)} ({r.fine.paidStatus})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/borrowings`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
