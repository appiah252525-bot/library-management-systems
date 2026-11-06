export type UserRole = "ADMIN" | "LIBRARIAN" | "STUDENT";

export type BorrowStatusType = "BORROWED" | "RETURNED" | "OVERDUE";

export type FineStatusType = "UNPAID" | "PAID";

export interface UserSummary {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
}

export interface StudentSummary {
  id: string;
  studentNumber: string;
  fullName: string;
  department: string;
  email: string;
  phone: string;
  userId?: string | null;
  createdAt: string;
  _count?: {
    borrowRecords: number;
  };
}

export interface BookSummary {
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
  description?: string | null;
  createdAt: string;
}

export interface BorrowRecordSummary {
  id: string;
  studentId: string;
  student: {
    id: string;
    studentNumber: string;
    fullName: string;
    email: string;
    department: string;
  };
  bookId: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverImage?: string | null;
  };
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: BorrowStatusType;
  notes?: string | null;
  fine?: {
    id: string;
    amount: number;
    paidStatus: FineStatusType;
    paidAt?: string | null;
    paymentMethod?: string | null;
  } | null;
}

export interface FineSummary {
  id: string;
  borrowRecordId: string;
  amount: number;
  paidStatus: FineStatusType;
  paidAt?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  borrowRecord: {
    id: string;
    student: {
      id: string;
      fullName: string;
      studentNumber: string;
      email: string;
    };
    book: {
      id: string;
      title: string;
      isbn: string;
    };
    borrowDate: string;
    dueDate: string;
    returnDate?: string | null;
    status: BorrowStatusType;
  };
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  borrowedBooks: number;
  overdueBooks: number;
  registeredStudents: number;
  totalUnpaidFines: number;
  recentBorrowings: BorrowRecordSummary[];
  monthlyBorrowTrends: { month: string; borrows: number; returns: number }[];
  categoryDistribution: { category: string; count: number }[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
