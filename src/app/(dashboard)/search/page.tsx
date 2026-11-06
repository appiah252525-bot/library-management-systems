"use client";

import * as React from "react";
import Link from "next/link";
import { Search, BookOpen, Filter, X, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { toast } from "sonner";
import Image from "next/image";

const CATEGORIES = [
  "All",
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

export default function SearchPage() {
  const [titleQuery, setTitleQuery] = React.useState("");
  const [authorQuery, setAuthorQuery] = React.useState("");
  const [isbnQuery, setIsbnQuery] = React.useState("");
  const [category, setCategory] = React.useState("All");

  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [borrowModal, setBorrowModal] = React.useState<{ isOpen: boolean; book: any | null }>({
    isOpen: false,
    book: null,
  });

  const performSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ limit: "50" });
      const queryParts = [titleQuery, authorQuery, isbnQuery].filter(Boolean).join(" ");
      if (queryParts) params.append("q", queryParts);
      if (category !== "All") params.append("category", category);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.books || []);
      } else {
        toast.error("Search query failed.");
      }
    } catch {
      toast.error("Network error during search.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitleQuery("");
    setAuthorQuery("");
    setIsbnQuery("");
    setCategory("All");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Advanced Catalog Search
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Query university holdings by title keywords, author name, ISBN identifier, or subject category
        </p>
      </div>

      {/* Advanced Search Form Panel */}
      <form
        onSubmit={performSearch}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Search by Book Title"
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            placeholder="e.g. Clean Architecture"
            startIcon={<BookOpen className="h-4 w-4" />}
          />

          <Input
            label="Search by Author"
            value={authorQuery}
            onChange={(e) => setAuthorQuery(e.target.value)}
            placeholder="e.g. Robert C. Martin"
            startIcon={<Search className="h-4 w-4" />}
          />

          <Input
            label="Search by ISBN"
            value={isbnQuery}
            onChange={(e) => setIsbnQuery(e.target.value)}
            placeholder="e.g. 978-0134494166"
          />

          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
              Filter by Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Clear Fields
          </Button>
          <Button type="submit" variant="primary" size="sm" className="text-xs" isLoading={isLoading}>
            <Search className="h-3.5 w-3.5" /> Execute Search
          </Button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Search Results {hasSearched && `(${results.length} matched)`}
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Use the criteria above to find books in the university catalog.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-foreground">No matching books found</p>
            <p className="text-xs mt-1">Try broadening your search query or removing category constraints.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((book) => {
              const available = book.availableQuantity ?? book.quantity;
              const isAvailable = available > 0;

              return (
                <div
                  key={book.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-muted shrink-0 border border-border">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {book.category}
                        </Badge>
                        <Badge variant={isAvailable ? "success" : "destructive"} className="text-[10px]">
                          {isAvailable ? `${available} in stock` : "Unavailable"}
                        </Badge>
                      </div>
                      <Link href={`/books/${book.id}`}>
                        <h4 className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                          {book.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        By {book.author} • Publisher: {book.publisher} ({book.publicationYear})
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        ISBN: {book.isbn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isAvailable && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setBorrowModal({ isOpen: true, book })}
                      >
                        Issue
                      </Button>
                    )}
                    <Link href={`/books/${book.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      <BorrowBookModal
        isOpen={borrowModal.isOpen}
        preselectedBook={borrowModal.book}
        onClose={() => setBorrowModal({ isOpen: false, book: null })}
        onSuccess={() => performSearch()}
      />
    </div>
  );
}
