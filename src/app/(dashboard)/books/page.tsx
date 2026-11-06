"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { BookCard } from "@/components/books/BookCard";
import { BookSearchFilter } from "@/components/books/BookSearchFilter";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { toast } from "sonner";

const CATEGORIES = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Literature & Arts",
  "Medicine",
  "Law",
  "Economics",
  "Other",
];

export default function BooksPage() {
  const [books, setBooks] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState({ page: 1, limit: 9, totalPages: 1, totalItems: 0 });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals state
  const [deleteModal, setDeleteModal] = React.useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: "",
    title: "",
  });
  const [borrowModal, setBorrowModal] = React.useState<{ isOpen: boolean; book: any | null }>({
    isOpen: false,
    book: null,
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchBooks = React.useCallback(
    async (page = 1, query = searchQuery, category = selectedCategory) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "9",
        });
        if (query.trim()) params.append("q", query.trim());
        if (category && category !== "All") params.append("category", category);

        const res = await fetch(`/api/books?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
          setMeta(data.meta || { page: 1, limit: 9, totalPages: 1, totalItems: 0 });
        } else {
          toast.error("Failed to load books catalog.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error fetching catalog.");
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedCategory]
  );

  React.useEffect(() => {
    fetchBooks(1);
  }, [selectedCategory]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    fetchBooks(1, q, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchBooks(1, searchQuery, cat);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    fetchBooks(1, "", "All");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/books/${deleteModal.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete book.");
      }
      toast.success(`"${deleteModal.title}" has been deleted from catalog.`);
      setDeleteModal({ isOpen: false, id: "", title: "" });
      fetchBooks(meta.page);
    } catch (err: any) {
      toast.error(err.message || "Could not delete book.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Book Inventory & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage titles, ISBN records, copies, stock availability, and loans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBooks(meta.page)}
            className="text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Link href="/books/new">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add New Book
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <BookSearchFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onReset={handleReset}
      />

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-2xl border border-border bg-card p-6 animate-pulse"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No books found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or category filters, or register a new book to the catalog.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
              Clear Filters
            </Button>
            <Link href="/books/new">
              <Button variant="primary" size="sm" className="text-xs">
                Add New Book
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={(b) => setBorrowModal({ isOpen: true, book: b })}
              onDelete={(id, title) => setDeleteModal({ isOpen: true, id, title })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        limit={meta.limit}
        onPageChange={(page) => fetchBooks(page)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", title: "" })}
        title="Confirm Book Deletion"
        description="Are you sure you want to remove this book from the university catalog?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-destructive/10 p-3.5 flex items-start gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              This action cannot be undone. Book: <strong className="font-semibold">{deleteModal.title}</strong> will be permanently deleted.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: false, id: "", title: "" })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete Book
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issue Book Modal */}
      <BorrowBookModal
        isOpen={borrowModal.isOpen}
        preselectedBook={borrowModal.book}
        onClose={() => setBorrowModal({ isOpen: false, book: null })}
        onSuccess={() => fetchBooks(meta.page)}
      />
    </div>
  );
}
