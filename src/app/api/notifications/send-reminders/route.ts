import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus } from "@prisma/client";

export async function POST() {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const now = new Date();
    const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [overdueRecords, dueSoonRecords] = await Promise.all([
      prisma.borrowRecord.findMany({
        where: { status: BorrowStatus.OVERDUE },
        include: { student: true, book: true },
      }),
      prisma.borrowRecord.findMany({
        where: {
          status: BorrowStatus.BORROWED,
          dueDate: { gte: now, lte: threeDaysAhead },
        },
        include: { student: true, book: true },
      }),
    ]);

    const sentOverdue = overdueRecords.length;
    const sentDueSoon = dueSoonRecords.length;
    const totalDispatched = sentOverdue + sentDueSoon;

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${totalDispatched} automated reminder notification(s) (${sentOverdue} overdue notices, ${sentDueSoon} due date reminders).`,
      timestamp: new Date().toISOString(),
      dispatchedCount: totalDispatched,
      details: {
        overdueNotices: sentOverdue,
        dueSoonReminders: sentDueSoon,
      },
    });
  } catch (error) {
    console.error("POST /api/notifications/send-reminders error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch reminder notifications" },
      { status: 500 }
    );
  }
}
