"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookFormData, BookSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { BookOpen, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface BookFormProps {
  initialData?: Partial<BookFormData> & { id?: string };
  isEdit?: boolean;
}

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

export function BookForm({ initialData, isEdit = false }: BookFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<Partial<BookFormData>>({
    title: initialData?.title || "",
    author: initialData?.author || "",
    isbn: initialData?.isbn || "",
    category: initialData?.category || CATEGORIES[0],
    publisher: initialData?.publisher || "",
    publicationYear: initialData?.publicationYear || new Date().getFullYear(),
    quantity: initialData?.quantity || 1,
    coverImage: initialData?.coverImage || "",
    description: initialData?.description || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "publicationYear" || name === "quantity"
          ? value === "" ? "" : parseInt(value, 10)
          : value,
    }));
    // clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = BookSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      toast.error("Please resolve the validation errors.");
      return;
    }

    try {
      const endpoint = isEdit ? `/api/books/${initialData?.id}` : "/api/books";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save book.");
      }

      toast.success(
        isEdit
          ? `Successfully updated "${result.data.title}"`
          : `Successfully registered "${result.data.title}"`
      );
      router.push("/books");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground">Book Information</h3>
            <p className="text-xs text-muted-foreground">General catalog identification and metadata</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Book Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to Algorithms, 4th Edition"
              error={errors.title}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author(s) *"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                error={errors.author}
              />
              <Input
                label="ISBN (10 or 13 digits) *"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g. 978-0262046305"
                error={errors.isbn}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-destructive mt-1">{errors.category}</p>
                )}
              </div>

              <Input
                label="Publisher *"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="e.g. MIT Press"
                error={errors.publisher}
              />

              <Input
                label="Publication Year *"
                type="number"
                name="publicationYear"
                value={formData.publicationYear || ""}
                onChange={handleChange}
                min={1800}
                max={2030}
                error={errors.publicationYear}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Quantity Available In Stock *"
                type="number"
                name="quantity"
                value={formData.quantity || ""}
                onChange={handleChange}
                min={1}
                helperText="Total physical copies owned by the university library."
                error={errors.quantity}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
                Description / Abstract
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Optional synopsis, syllabus topics covered, or notes..."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cover Preview & Media (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">Cover Image</h3>
              <p className="text-xs text-muted-foreground">URL to high-res book jacket</p>
            </div>

            <Input
              label="Cover Image URL"
              name="coverImage"
              value={formData.coverImage || ""}
              onChange={handleChange}
              placeholder="https://... or unsplash/openlibrary URL"
              startIcon={<ImageIcon className="h-4 w-4" />}
              error={errors.coverImage}
            />

            {/* Live Preview Card */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">
                Visual Preview:
              </span>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-dashed border-border bg-muted flex items-center justify-center">
                {formData.coverImage ? (
                  <Image
                    src={formData.coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    onError={() => {
                      setErrors((prev) => ({
                        ...prev,
                        coverImage: "Image failed to load. Please check the URL.",
                      }));
                    }}
                  />
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">No cover image specified</p>
                    <p className="text-[10px] mt-1 text-muted-foreground/70">
                      Paste a direct image URL to preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
              <Save className="h-4 w-4" /> {isEdit ? "Update Book" : "Save Book"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
