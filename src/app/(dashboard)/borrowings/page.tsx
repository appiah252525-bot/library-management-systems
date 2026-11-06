"use client";

import * as React from "react";
import Link from "next/link";
import {
  Repeat,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function BorrowingsPage() {
  const [records, setRecords] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [activeTab, setActiveTab] = React.useState<"ALL" | "BORROWED" | "OVERDUE" | "RETURNED">("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isIssueModalOpen, setIsIssueModalOpen] = React.useState(false);
  const [returningId, setReturningId] = React.useState<string | null>(null);

  const fetchRecords = React.useCallback(
    async (page = 1, status = activeTab, query = searchQuery) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (status !== "ALL") params.append("status", status);
        if (query.trim()) params.append("q", query.trim());

        const res = await fetch(`/api/borrowings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
          setMeta(data.meta || { page: 1, limit: 10, totalPages: 1, totalItems: 0 });
        }
      } catch {
        toast.error("Failed to load circulation records.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, searchQuery]
  );

  React.useEffect(() => {
    fetchRecords(1, activeTab, searchQuery);
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(1, activeTab, searchQuery);
  };

  const handleReturn = async (id: string) => {
    setReturningId(id);
    try {
      const res = await fetch("/api/borrowings/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowRecordId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to return book.");
      toast.success(data.message || "Book successfully marked as returned.");
      fetchRecords(meta.page, activeTab, searchQuery);
    } catch (err: any) {
      toast.error(err.message || "Error returning book.");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Circulation Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Issue books, process returns, track due dates, and monitor overdue fines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRecords(meta.page, activeTab, searchQuery)}
            className="text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsIssueModalOpen(true)}
            className="text-xs gap-1.5 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" /> Issue Book
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
          {(["ALL", "BORROWED", "OVERDUE", "RETURNED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL"
                ? "All Records"
                : tab === "BORROWED"
                ? "Active Loans"
                : tab === "OVERDUE"
                ? "Overdue"
                : "Returned"}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or title..."
            className="h-9 w-full rounded-xl border border-input bg-muted/30 pl-9 pr-3 text-xs text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      {/* Circulation Records Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Book Details</th>
                <th className="px-6 py-3.5">Student Patron</th>
                <th className="px-6 py-3.5">Issued</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Returned</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Fine</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-4 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    <Repeat className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    No circulation records found for this view.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-xs text-foreground line-clamp-1">
                            {r.book.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">ISBN: {r.book.isbn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-xs text-foreground block">
                          {r.student.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {r.student.studentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(r.borrowDate)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-foreground">
                      {formatDate(r.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(r.returnDate)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          r.status === "RETURNED"
                            ? "success"
                            : r.status === "OVERDUE"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {r.fine ? (
                        <span
                          className={`font-semibold ${
                            r.fine.paidStatus === "PAID"
                              ? "text-emerald-600"
                              : "text-rose-600 font-bold"
                          }`}
                        >
                          {formatCurrency(r.fine.amount)} ({r.fine.paidStatus})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== "RETURNED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleReturn(r.id)}
                          isLoading={returningId === r.id}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Return Book
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        limit={meta.limit}
        onPageChange={(p) => fetchRecords(p, activeTab, searchQuery)}
      />

      {/* Issue Modal */}
      <BorrowBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={() => fetchRecords(meta.page, activeTab, searchQuery)}
      />
    </div>
  );
}
