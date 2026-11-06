"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { BookOpen, UserCheck, Calendar } from "lucide-react";

interface BorrowBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: { id: string; title: string; isbn: string; availableQuantity?: number } | null;
  preselectedStudent?: { id: string; fullName: string; studentNumber: string } | null;
  onSuccess?: () => void;
}

export function BorrowBookModal({
  isOpen,
  onClose,
  preselectedBook,
  preselectedStudent,
  onSuccess,
}: BorrowBookModalProps) {
  const [students, setStudents] = React.useState<any[]>([]);
  const [books, setBooks] = React.useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState("");
  const [selectedBookId, setSelectedBookId] = React.useState("");
  const [dueDate, setDueDate] = React.useState(
    format(addDays(new Date(), 14), "yyyy-MM-dd")
  );
  const [notes, setNotes] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingData, setIsFetchingData] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (preselectedBook) setSelectedBookId(preselectedBook.id);
      if (preselectedStudent) setSelectedStudentId(preselectedStudent.id);

      const loadOptions = async () => {
        setIsFetchingData(true);
        try {
          const [studentsRes, booksRes] = await Promise.all([
            fetch("/api/students?limit=100"),
            fetch("/api/books?limit=100"),
          ]);
          if (studentsRes.ok) {
            const data = await studentsRes.json();
            setStudents(data.students || []);
            if (!preselectedStudent && data.students?.length > 0) {
              setSelectedStudentId(data.students[0].id);
            }
          }
          if (booksRes.ok) {
            const data = await booksRes.json();
            setBooks(data.books || []);
            if (!preselectedBook && data.books?.length > 0) {
              setSelectedBookId(data.books[0].id);
            }
          }
        } catch (e) {
          console.error("Failed to load options", e);
        } finally {
          setIsFetchingData(false);
        }
      };

      loadOptions();
    }
  }, [isOpen, preselectedBook, preselectedStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId || !dueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          bookId: selectedBookId,
          dueDate: new Date(dueDate).toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to issue book.");
      }

      toast.success(
        `Successfully issued book to ${data.record.student.fullName}. Due: ${format(
          new Date(dueDate),
          "MMM dd, yyyy"
        )}`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue book.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Book (Check-Out)"
      description="Record a new book loan for an enrolled student."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Book Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Select Book *
          </label>
          {preselectedBook ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <span className="font-semibold text-foreground block">{preselectedBook.title}</span>
              <span className="text-muted-foreground">ISBN: {preselectedBook.isbn}</span>
            </div>
          ) : (
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={isFetchingData}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableQuantity <= 0}>
                  {b.title} ({b.availableQuantity > 0 ? `${b.availableQuantity} available` : "Out of stock"})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Select Student Patron *
          </label>
          {preselectedStudent ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <span className="font-semibold text-foreground block">{preselectedStudent.fullName}</span>
              <span className="text-muted-foreground">{preselectedStudent.studentNumber}</span>
            </div>
          ) : (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={isFetchingData}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentNumber}) - {s.department}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Due Date (Standard Loan: 14 Days) *
          </label>
          <Input
            type="date"
            value={dueDate}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
            Loan Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Course reserve, thesis research..."
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Confirm Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
