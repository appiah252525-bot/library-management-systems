"use client";

import * as React from "react";
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  CreditCard,
  Receipt,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function FinesPage() {
  const [fines, setFines] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState({ totalUnpaidAmount: 0, totalPaidAmount: 0 });
  const [meta, setMeta] = React.useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [filterStatus, setFilterStatus] = React.useState<"ALL" | "UNPAID" | "PAID">("UNPAID");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Pay Fine Modal
  const [payModal, setPayModal] = React.useState<{ isOpen: boolean; fine: any | null }>({
    isOpen: false,
    fine: null,
  });
  const [paymentMethod, setPaymentMethod] = React.useState("Cash (Front Desk)");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchFines = React.useCallback(
    async (page = 1, status = filterStatus, q = searchQuery) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (status !== "ALL") params.append("status", status);
        if (q.trim()) params.append("q", q.trim());

        const res = await fetch(`/api/fines?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setFines(data.fines || []);
          setSummary(data.summary || { totalUnpaidAmount: 0, totalPaidAmount: 0 });
          setMeta(data.meta || { page: 1, limit: 10, totalPages: 1, totalItems: 0 });
        }
      } catch {
        toast.error("Failed to load fine records.");
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus, searchQuery]
  );

  React.useEffect(() => {
    fetchFines(1, filterStatus, searchQuery);
  }, [filterStatus]);

  const handlePayConfirm = async () => {
    if (!payModal.fine) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/fines/${payModal.fine.id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process payment.");
      toast.success(data.message || "Fine settled successfully.");
      setPayModal({ isOpen: false, fine: null });
      fetchFines(meta.page, filterStatus, searchQuery);
    } catch (err: any) {
      toast.error(err.message || "Error processing payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Fine Management & Penalties
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audit overdue charges, assess late return fees, and record cash or digital settlements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFines(meta.page, filterStatus, searchQuery)}
          className="text-xs"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Overview Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Unpaid Fines Outstanding
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              {formatCurrency(summary.totalUnpaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Pending collection from student patrons</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Settled Fines Collected
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(summary.totalPaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Collected & deposited into library fund</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
          {(["UNPAID", "PAID", "ALL"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "UNPAID" ? "Unpaid / Pending" : status === "PAID" ? "Settled / Paid" : "All Fines"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchFines(1, filterStatus, e.target.value);
            }}
            placeholder="Search by student or title..."
            className="h-9 w-full rounded-xl border border-input bg-muted/30 pl-9 pr-3 text-xs text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Fines Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Student Patron</th>
                <th className="px-6 py-3.5">Overdue Book</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Fine Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Payment Details</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    No fines found for this category.
                  </td>
                </tr>
              ) : (
                fines.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-xs text-foreground block">
                          {f.borrowRecord.student.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {f.borrowRecord.student.studentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium text-xs text-foreground line-clamp-1">
                          {f.borrowRecord.book.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(f.borrowRecord.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-foreground">
                        {formatCurrency(f.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={f.paidStatus === "PAID" ? "success" : "destructive"}>
                        {f.paidStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {f.paidStatus === "PAID" ? (
                        <div>
                          <span className="font-medium text-foreground block">
                            {f.paymentMethod || "Settled"}
                          </span>
                          <span className="text-[10px]">{formatDate(f.paidAt)}</span>
                        </div>
                      ) : (
                        <span className="text-rose-600 font-semibold">Payment Required</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.paidStatus === "UNPAID" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setPayModal({ isOpen: true, fine: f })}
                        >
                          <Receipt className="h-3.5 w-3.5" /> Settle Fine
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
        onPageChange={(p) => fetchFines(p, filterStatus, searchQuery)}
      />

      {/* Pay Fine Modal */}
      <Modal
        isOpen={payModal.isOpen}
        onClose={() => setPayModal({ isOpen: false, fine: null })}
        title="Record Fine Payment"
        description="Acknowledge fine payment receipt and clear student library penalty."
        maxWidth="sm"
      >
        {payModal.fine && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-semibold text-foreground">
                  {payModal.fine.borrowRecord.student.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Book:</span>
                <span className="font-semibold text-foreground line-clamp-1 max-w-[200px]">
                  {payModal.fine.borrowRecord.book.title}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="font-bold text-foreground">Fine Due:</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(payModal.fine.amount)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Cash (Front Desk)">Cash (Front Desk)</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
                <option value="University Student Account Balance">University Student Account Balance</option>
                <option value="Digital Transfer / Stripe">Digital Transfer / Stripe</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayModal({ isOpen: false, fine: null })}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePayConfirm}
                isLoading={isProcessing}
              >
                Confirm Settlement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
