import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInCalendarDays, isAfter } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMM dd, yyyy");
  } catch {
    return "Invalid Date";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMM dd, yyyy h:mm a");
  } catch {
    return "Invalid Date";
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function calculateOverdueDays(
  dueDate: string | Date,
  returnDate?: string | Date | null
): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const compareTo = returnDate
    ? typeof returnDate === "string"
      ? new Date(returnDate)
      : returnDate
    : new Date();

  if (isAfter(compareTo, due)) {
    return Math.max(0, differenceInCalendarDays(compareTo, due));
  }
  return 0;
}

export function calculateFineAmount(
  dueDate: string | Date,
  returnDate?: string | Date | null,
  ratePerDay = 1.0
): number {
  const days = calculateOverdueDays(dueDate, returnDate);
  return Number((days * ratePerDay).toFixed(2));
}

export function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
