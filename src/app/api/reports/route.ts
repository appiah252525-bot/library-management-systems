import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BorrowStatus, FineStatus } from "@prisma/client";

export async function GET() {
  try {
    const now = new Date();

    // 1. Most Borrowed Books
    const mostBorrowedBooks = await prisma.book.findMany({
      take: 8,
      include: {
        _count: {
          select: { borrowRecords: true },
        },
      },
      orderBy: {
        borrowRecords: {
          _count: "desc",
        },
      },
    });

    // 2. Active Students (most borrow records)
    const activeStudents = await prisma.student.findMany({
      take: 8,
      include: {
        _count: {
          select: { borrowRecords: true },
        },
        borrowRecords: {
          where: {
            status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
          },
          select: { id: true },
        },
      },
      orderBy: {
        borrowRecords: {
          _count: "desc",
        },
      },
    });

    // 3. Current Overdue Books List
    const overdueRecords = await prisma.borrowRecord.findMany({
      where: {
        status: BorrowStatus.OVERDUE,
      },
      include: {
        student: true,
        book: true,
        fine: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // 4. Overall Book Inventory Stats
    const [totalBooksCount, copiesSum, borrowedCount] = await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({ _sum: { quantity: true } }),
      prisma.borrowRecord.count({
        where: {
          status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
        },
      }),
    ]);

    const totalCopies = copiesSum._sum.quantity || 0;
    const availableCopies = Math.max(0, totalCopies - borrowedCount);

    // 5. Fine Collection Metrics
    const [unpaidFines, paidFines, totalFinesCount] = await Promise.all([
      prisma.fine.aggregate({
        where: { paidStatus: FineStatus.UNPAID },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.fine.aggregate({
        where: { paidStatus: FineStatus.PAID },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.fine.count(),
    ]);

    // 6. Category breakdown
    const categoryStats = await prisma.book.groupBy({
      by: ["category"],
      _sum: { quantity: true },
      _count: { id: true },
    });

    return NextResponse.json({
      inventory: {
        uniqueTitles: totalBooksCount,
        totalCopies,
        borrowedCopies: borrowedCount,
        availableCopies,
      },
      fines: {
        totalRecords: totalFinesCount,
        unpaidAmount: unpaidFines._sum.amount || 0,
        unpaidCount: unpaidFines._count.id || 0,
        paidAmount: paidFines._sum.amount || 0,
        paidCount: paidFines._count.id || 0,
      },
      mostBorrowedBooks: mostBorrowedBooks.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        totalBorrows: b._count.borrowRecords,
        quantity: b.quantity,
      })),
      activeStudents: activeStudents.map((s) => ({
        id: s.id,
        studentNumber: s.studentNumber,
        fullName: s.fullName,
        department: s.department,
        email: s.email,
        totalBorrows: s._count.borrowRecords,
        activeBorrows: s.borrowRecords.length,
      })),
      overdueRecords: overdueRecords.map((r) => {
        const daysOverdue = Math.max(
          1,
          Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          id: r.id,
          studentName: r.student.fullName,
          studentEmail: r.student.email,
          studentNumber: r.student.studentNumber,
          bookTitle: r.book.title,
          dueDate: r.dueDate,
          daysOverdue,
          fineAmount: r.fine?.amount || daysOverdue * 1.0,
          finePaid: r.fine?.paidStatus === FineStatus.PAID,
        };
      }),
      categoryStats: categoryStats.map((c) => ({
        category: c.category,
        titleCount: c._count.id,
        totalCopies: c._sum.quantity || 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
