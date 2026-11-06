"use client";

import * as React from "react";
import {
  BarChart3,
  BookOpen,
  Users,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchReports = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error("Failed to generate library reports.");
      }
    } catch {
      toast.error("Network error fetching reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-card rounded-2xl border border-border animate-pulse" />
          <div className="h-32 bg-card rounded-2xl border border-border animate-pulse" />
          <div className="h-32 bg-card rounded-2xl border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 print:p-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            University Library Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Institutional metrics on circulation velocity, overdue exposure, patron engagement, and revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} className="text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="h-3.5 w-3.5" /> Print / Export PDF
          </Button>
        </div>
      </div>

      {/* High-Level Inventory Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Unique Titles</span>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{data.inventory.uniqueTitles}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Cataloged book editions</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Total Copies</span>
          <div className="mt-2 text-2xl font-extrabold text-primary">{data.inventory.totalCopies}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Physical volumes in collection</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-muted-foreground">On Active Loan</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{data.inventory.borrowedCopies}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {((data.inventory.borrowedCopies / (data.inventory.totalCopies || 1)) * 100).toFixed(1)}% utilization rate
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Available on Shelves</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{data.inventory.availableCopies}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Ready for checkout</p>
        </div>
      </div>

      {/* Two Column Section: Most Borrowed Books + Active Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Books */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Most Borrowed Books</h3>
              <p className="text-xs text-muted-foreground">Highest checkout frequency across campus</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <div className="divide-y divide-border text-xs">
            {data.mostBorrowedBooks.map((b: any, index: number) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-muted-foreground w-5 text-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-foreground line-clamp-1">{b.title}</h5>
                    <p className="text-muted-foreground text-[11px]">
                      By {b.author} • {b.category}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="shrink-0 text-xs font-bold">
                  {b.totalBorrows} loans
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Students */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Top Active Student Patrons</h3>
              <p className="text-xs text-muted-foreground">Students with the highest borrowing engagement</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </div>

          <div className="divide-y divide-border text-xs">
            {data.activeStudents.map((s: any, index: number) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-muted-foreground w-5 text-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-foreground">{s.fullName}</h5>
                    <p className="text-muted-foreground text-[11px]">
                      {s.studentNumber} • {s.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground block">{s.totalBorrows} checkouts</span>
                  <span className="text-[10px] text-muted-foreground">{s.activeBorrows} active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Books Audit Report */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Delinquent & Overdue Loans Audit</h3>
            <p className="text-xs text-muted-foreground">Books exceeding maximum allowed loan duration</p>
          </div>
          <AlertCircle className="h-5 w-5 text-rose-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3">Book Title</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Days Overdue</th>
                <th className="px-6 py-3">Fine Accrued</th>
                <th className="px-6 py-3 text-right">Fine Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.overdueRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-muted-foreground">
                    No overdue books currently detected in circulation.
                  </td>
                </tr>
              ) : (
                data.overdueRecords.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-6 py-3.5 font-semibold text-foreground max-w-xs truncate">
                      {r.bookTitle}
                    </td>
                    <td className="px-6 py-3.5">{r.studentName}</td>
                    <td className="px-6 py-3.5 font-mono">{r.studentNumber}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDate(r.dueDate)}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-rose-600">+{r.daysOverdue} days</span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-foreground">
                      {formatCurrency(r.fineAmount)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge variant={r.finePaid ? "success" : "destructive"}>
                        {r.finePaid ? "PAID" : "UNPAID"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fine Collection Financial Summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Fine Collection Financial Ledger</h3>
            <p className="text-xs text-muted-foreground">Cumulative penalties recorded and deposited</p>
          </div>
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Total Fines Assessed:</span>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(data.fines.unpaidAmount + data.fines.paidAmount)}
            </div>
            <span className="text-[11px] text-muted-foreground">Across {data.fines.totalRecords} incident(s)</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Fines Settled & Deposited:</span>
            <div className="text-xl font-bold text-emerald-600">
              {formatCurrency(data.fines.paidAmount)}
            </div>
            <span className="text-[11px] text-muted-foreground">{data.fines.paidCount} record(s) settled</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Outstanding Pending Balance:</span>
            <div className="text-xl font-bold text-rose-600">
              {formatCurrency(data.fines.unpaidAmount)}
            </div>
            <span className="text-[11px] text-muted-foreground">{data.fines.unpaidCount} unresolved fine(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
