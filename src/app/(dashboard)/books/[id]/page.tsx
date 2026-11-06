"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  Hash,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [book, setBook] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchBookDetails = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data.book);
      } else {
        toast.error("Book not found.");
        router.push("/books");
      }
    } catch {
      toast.error("Error fetching book details.");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    if (id) fetchBookDetails();
  }, [id, fetchBookDetails]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete book.");
      }
      toast.success("Book deleted successfully.");
      router.push("/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete book.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-card rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!book) return null;

  const isAvailable = book.availableQuantity > 0;

  return (
    <div className="space-y-8">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/books">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {isAvailable && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBorrowModalOpen(true)}
              className="text-xs"
            >
              Issue This Book
            </Button>
          )}

          <Link href={`/books/${id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover Artwork Column */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-md">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                <BookOpen className="h-24 w-24 text-primary/30" />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inventory Status</span>
              <Badge variant={isAvailable ? "success" : "destructive"}>
                {isAvailable ? `${book.availableQuantity} Copies Available` : "Checked Out"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Physical Copies</span>
              <span className="font-bold text-foreground">{book.quantity}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Loans</span>
              <span className="font-bold text-foreground">{book.activeBorrows}</span>
            </div>
          </div>
        </div>

        {/* Metadata & History Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {book.category}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {book.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">By {book.author}</p>
            </div>

            {book.description && (
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Synopsis / Overview
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" /> ISBN
                </span>
                <span className="text-xs font-semibold text-foreground">{book.isbn}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" /> Publisher
                </span>
                <span className="text-xs font-semibold text-foreground">{book.publisher}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Publication Year
                </span>
                <span className="text-xs font-semibold text-foreground">{book.publicationYear}</span>
              </div>
            </div>
          </div>

          {/* Borrowing History */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Borrowing Records for this Title</h3>
              <p className="text-xs text-muted-foreground">Most recent patron check-outs and returns</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Borrow Date</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Return Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {!book.borrowRecords || book.borrowRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-muted-foreground">
                        No circulation records recorded yet for this book.
                      </td>
                    </tr>
                  ) : (
                    book.borrowRecords.map((r: any) => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-foreground">{r.student?.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">{r.student?.studentNumber}</div>
                        </td>
                        <td className="px-6 py-3.5">{formatDate(r.borrowDate)}</td>
                        <td className="px-6 py-3.5 font-medium">{formatDate(r.dueDate)}</td>
                        <td className="px-6 py-3.5">{formatDate(r.returnDate)}</td>
                        <td className="px-6 py-3.5">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Book Deletion"
        description="Are you sure you want to delete this book?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Deleting this book will permanently remove it from the catalog.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issue Book Modal */}
      <BorrowBookModal
        isOpen={isBorrowModalOpen}
        preselectedBook={book}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={fetchBookDetails}
      />
    </div>
  );
}
