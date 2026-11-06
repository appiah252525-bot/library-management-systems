import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BorrowStatus } from "@prisma/client";

export async function GET() {
  try {
    const now = new Date();
    const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. Books Due Soon (within 3 days, not overdue yet)
    const dueSoonRecords = await prisma.borrowRecord.findMany({
      where: {
        status: BorrowStatus.BORROWED,
        dueDate: {
          gte: now,
          lte: threeDaysAhead,
        },
      },
      include: {
        student: true,
        book: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // 2. Overdue Books
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

    const notifications = [
      ...overdueRecords.map((r) => {
        const daysOverdue = Math.max(
          1,
          Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          id: `overdue-${r.id}`,
          type: "OVERDUE",
          recordId: r.id,
          studentName: r.student.fullName,
          studentEmail: r.student.email,
          studentNumber: r.student.studentNumber,
          bookTitle: r.book.title,
          dueDate: r.dueDate,
          daysOverdue,
          fineAmount: r.fine?.amount || daysOverdue * 1.0,
          title: `Overdue Notice: ${r.book.title}`,
          message: `${r.student.fullName} has had "${r.book.title}" overdue for ${daysOverdue} day(s). Accumulated fine: $${(
            r.fine?.amount || daysOverdue * 1.0
          ).toFixed(2)}.`,
          severity: "high",
        };
      }),
      ...dueSoonRecords.map((r) => {
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(r.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          id: `due-soon-${r.id}`,
          type: "DUE_SOON",
          recordId: r.id,
          studentName: r.student.fullName,
          studentEmail: r.student.email,
          studentNumber: r.student.studentNumber,
          bookTitle: r.book.title,
          dueDate: r.dueDate,
          daysLeft,
          title: `Due Soon Reminder: ${r.book.title}`,
          message: `"${r.book.title}" borrowed by ${r.student.fullName} is due in ${daysLeft} day(s).`,
          severity: "medium",
        };
      }),
    ];

    return NextResponse.json({
      notifications,
      totalCount: notifications.length,
      overdueCount: overdueRecords.length,
      dueSoonCount: dueSoonRecords.length,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
