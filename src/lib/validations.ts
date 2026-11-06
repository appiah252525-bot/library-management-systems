import { z } from "zod";

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  author: z.string().min(1, "Author is required").max(255),
  isbn: z
    .string()
    .min(10, "ISBN must be at least 10 characters")
    .max(20, "ISBN must not exceed 20 characters")
    .regex(/^[\d-]+$/, "ISBN can only contain numbers and hyphens"),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().min(1, "Publisher is required"),
  publicationYear: z
    .coerce
    .number()
    .int("Year must be an integer")
    .min(1450, "Invalid year")
    .max(new Date().getFullYear() + 1, "Year cannot be in the far future"),
  quantity: z
    .coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(2000, "Description too long").optional().or(z.literal("")),
});

export type BookFormData = z.infer<typeof BookSchema>;

export const StudentSchema = z.object({
  studentNumber: z
    .string()
    .min(3, "Student ID must be at least 3 characters")
    .max(30),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(25),
});

export type StudentFormData = z.infer<typeof StudentSchema>;

export const BorrowBookSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  bookId: z.string().min(1, "Book is required"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid due date is required",
  }),
  notes: z.string().max(500).optional(),
});

export type BorrowBookFormData = z.infer<typeof BorrowBookSchema>;

export const ReturnBookSchema = z.object({
  borrowRecordId: z.string().min(1, "Borrow record ID is required"),
  returnDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const FinePaymentSchema = z.object({
  fineId: z.string().min(1, "Fine ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
