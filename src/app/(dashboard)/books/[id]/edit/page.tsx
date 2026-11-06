"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { BookForm } from "@/components/books/BookForm";
import { toast } from "sonner";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [book, setBook] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data.book);
        } else {
          toast.error("Book not found");
          router.push("/books");
        }
      } catch {
        toast.error("Failed to load book for editing");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadBook();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-card rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Edit Book Details
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Modify title metadata, publisher details, or update library copy count
        </p>
      </div>

      <BookForm initialData={book} isEdit={true} />
    </div>
  );
}
