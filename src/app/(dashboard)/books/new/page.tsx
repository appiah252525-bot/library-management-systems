import { BookForm } from "@/components/books/BookForm";

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Register New Book
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Enter metadata, ISBN, stock quantity, and cover artwork to catalog a title
        </p>
      </div>

      <BookForm />
    </div>
  );
}
