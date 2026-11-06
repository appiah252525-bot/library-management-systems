"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Edit, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publisher: string;
    publicationYear: number;
    quantity: number;
    availableQuantity?: number;
    coverImage?: string | null;
  };
  onDelete?: (id: string, title: string) => void;
  onBorrow?: (book: any) => void;
  canManage?: boolean;
}

export function BookCard({ book, onDelete, onBorrow, canManage = true }: BookCardProps) {
  const available = book.availableQuantity !== undefined ? book.availableQuantity : book.quantity;
  const isAvailable = available > 0;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div>
        {/* Cover Image Header */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-muted text-primary">
              <BookOpen className="h-16 w-16 opacity-40" />
            </div>
          )}

          {/* Category Badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="backdrop-blur-md bg-card/90 shadow-sm text-[11px]">
              {book.category}
            </Badge>
          </div>

          {/* Availability pill overlay */}
          <div className="absolute top-3 right-3">
            <Badge
              variant={isAvailable ? "success" : "destructive"}
              className="backdrop-blur-md bg-card/95 shadow-sm text-[11px] gap-1 font-semibold"
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> {available} in stock
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" /> Checked out
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-5">
          <Link href={`/books/${book.id}`}>
            <h4 className="font-bold text-base text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
              {book.title}
            </h4>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">By {book.author}</p>

          <div className="mt-4 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-muted-foreground/90 border-t border-border pt-3">
            <div>
              <span className="font-semibold text-foreground/80">ISBN:</span> {book.isbn}
            </div>
            <div>
              <span className="font-semibold text-foreground/80">Year:</span> {book.publicationYear}
            </div>
            <div>
              <span className="font-semibold text-foreground/80">Total Copies:</span> {book.quantity}
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3">
        <Link href={`/books/${book.id}`}>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            View Details
          </Button>
        </Link>

        <div className="flex items-center gap-1.5">
          {onBorrow && isAvailable && (
            <Button
              size="sm"
              variant="primary"
              className="h-8 text-xs px-2.5"
              onClick={() => onBorrow(book)}
            >
              Issue
            </Button>
          )}

          {canManage && (
            <>
              <Link href={`/books/${book.id}/edit`}>
                <Button variant="outline" size="icon" className="h-8 w-8" title="Edit Book">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  title="Delete Book"
                  onClick={() => onDelete(book.id, book.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
