import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BorrowBookSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus, FineStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");
    const bookId = searchParams.get("bookId");
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status as BorrowStatus;
    }

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (bookId) {
      whereClause.bookId = bookId;
    }

    if (q) {
      whereClause.OR = [
        { student: { fullName: { contains: q, mode: "insensitive" } } },
        { student: { studentNumber: { contains: q, mode: "insensitive" } } },
        { book: { title: { contains: q, mode: "insensitive" } } },
        { book: { isbn: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [totalItems, borrowRecords] = await Promise.all([
      prisma.borrowRecord.count({ where: whereClause }),
      prisma.borrowRecord.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: true,
          book: true,
          fine: true,
        },
      }),
    ]);

    return NextResponse.json({
      records: borrowRecords,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/borrowings error:", error);
    return NextResponse.json({ error: "Failed to fetch borrow records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validatedData = BorrowBookSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentId, bookId, dueDate, notes } = validatedData.data;

    // 1. Verify Student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        borrowRecords: {
          where: {
            OR: [
              { status: BorrowStatus.OVERDUE },
              { fine: { paidStatus: FineStatus.UNPAID } },
            ],
          },
          include: { fine: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if student has overdue books or unpaid fines
    const overdueCount = student.borrowRecords.filter(
      (r) => r.status === BorrowStatus.OVERDUE
    ).length;
    if (overdueCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot issue book: Student has ${overdueCount} overdue item(s) that must be returned first.`,
        },
        { status: 400 }
      );
    }

    // 2. Verify Book & Inventory Availability
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        borrowRecords: {
          where: {
            status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const activeBorrows = book.borrowRecords.length;
    const availableCopies = book.quantity - activeBorrows;

    if (availableCopies <= 0) {
      return NextResponse.json(
        {
          error: `No copies available. All ${book.quantity} copies of "${book.title}" are currently borrowed.`,
        },
        { status: 409 }
      );
    }

    // Check if this student already has a copy of this book currently borrowed
    const alreadyBorrowing = book.borrowRecords.some((r) => r.studentId === studentId);
    if (alreadyBorrowing) {
      return NextResponse.json(
        {
          error: "This student already has an active borrow record for this book.",
        },
        { status: 400 }
      );
    }

    // 3. Create Borrow Record
    const newRecord = await prisma.borrowRecord.create({
      data: {
        studentId,
        bookId,
        borrowDate: new Date(),
        dueDate: new Date(dueDate),
        status: BorrowStatus.BORROWED,
        notes: notes || null,
      },
      include: {
        student: true,
        book: true,
      },
    });

    return NextResponse.json({ record: newRecord }, { status: 201 });
  } catch (error) {
    console.error("POST /api/borrowings error:", error);
    return NextResponse.json({ error: "Failed to issue book" }, { status: 500 });
  }
}
