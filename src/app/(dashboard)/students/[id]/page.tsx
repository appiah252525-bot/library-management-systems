"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [student, setStudent] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = React.useState(false);

  const fetchStudentData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
      } else {
        toast.error("Student profile not found.");
        router.push("/students");
      }
    } catch {
      toast.error("Failed to load student profile.");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    if (id) fetchStudentData();
  }, [id, fetchStudentData]);

  const handleReturnBook = async (recordId: string) => {
    try {
      const res = await fetch("/api/borrowings/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowRecordId: recordId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to return book.");
      toast.success(data.message || "Book returned successfully.");
      fetchStudentData();
    } catch (err: any) {
      toast.error(err.message || "Return processing failed.");
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      const res = await fetch(`/api/fines/${fineId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Front Desk Cash/Card" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to settle fine.");
      toast.success(data.message || "Fine settled successfully.");
      fetchStudentData();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-card rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Students
          </Button>
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsBorrowModalOpen(true)}
          className="text-xs gap-1.5 shadow-sm"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Issue Book to Student
        </Button>
      </div>

      {/* Student Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{student.fullName}</h2>
              <span className="font-mono text-xs font-semibold text-primary">
                {student.studentNumber}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground/80">Department:</span>
              <Badge variant="secondary">{student.department}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground/80">Email:</span>
              <span>{student.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground/80">Phone:</span>
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground/80">Joined:</span>
              <span>{formatDate(student.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Loans
            </span>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-foreground">
                {student.activeBorrowsCount}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Currently in possession</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lifetime Borrows
            </span>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-foreground">
                {student.borrowRecords?.length || 0}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Total books checked out</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unpaid Fines
            </span>
            <div className="mt-4">
              <span
                className={`text-3xl font-extrabold ${
                  student.unpaidFinesTotal > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(student.unpaidFinesTotal)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {student.unpaidFinesTotal > 0 ? "Outstanding overdue balance" : "Clear standing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Records & History Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Circulation History</h3>
          <p className="text-xs text-muted-foreground">Complete record of books issued to this patron</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Book Title</th>
                <th className="px-6 py-3.5">Issued Date</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Returned Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Fine</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!student.borrowRecords || student.borrowRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-muted-foreground">
                    No borrowing history recorded for this student.
                  </td>
                </tr>
              ) : (
                student.borrowRecords.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div className="font-semibold text-xs line-clamp-1">{r.book.title}</div>
                          <div className="text-[10px] text-muted-foreground">{r.book.isbn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(r.borrowDate)}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-foreground">
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
                        <div className="space-y-1">
                          <span
                            className={
                              r.fine.paidStatus === "PAID"
                                ? "text-emerald-600 font-semibold"
                                : "text-rose-600 font-bold"
                            }
                          >
                            {formatCurrency(r.fine.amount)} ({r.fine.paidStatus})
                          </span>
                          {r.fine.paidStatus === "UNPAID" && (
                            <button
                              onClick={() => handlePayFine(r.fine.id)}
                              className="block text-[10px] text-primary hover:underline font-bold"
                            >
                              Settle Fine
                            </button>
                          )}
                        </div>
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
                          onClick={() => handleReturnBook(r.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mark Returned
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

      {/* Borrow Book Modal */}
      <BorrowBookModal
        isOpen={isBorrowModalOpen}
        preselectedStudent={student}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={fetchStudentData}
      />
    </div>
  );
}
