import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReturnBookSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus, FineStatus } from "@prisma/client";
import { calculateFineAmount, calculateOverdueDays } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validatedData = ReturnBookSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { borrowRecordId, returnDate: userReturnDate, notes } = validatedData.data;

    const record = await prisma.borrowRecord.findUnique({
      where: { id: borrowRecordId },
      include: {
        fine: true,
        book: true,
        student: true,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Borrow record not found" }, { status: 404 });
    }

    if (record.status === BorrowStatus.RETURNED) {
      return NextResponse.json(
        { error: "This book has already been marked as returned." },
        { status: 400 }
      );
    }

    const returnDate = userReturnDate ? new Date(userReturnDate) : new Date();
    const overdueDays = calculateOverdueDays(record.dueDate, returnDate);
    const fineRate = parseFloat(process.env.NEXT_PUBLIC_FINE_PER_DAY || "1.00");
    const fineAmount = calculateFineAmount(record.dueDate, returnDate, fineRate);

    // Update borrow record
    const updatedRecord = await prisma.borrowRecord.update({
      where: { id: borrowRecordId },
      data: {
        returnDate,
        status: BorrowStatus.RETURNED,
        notes: notes ? (record.notes ? `${record.notes} | Return note: ${notes}` : notes) : record.notes,
      },
      include: {
        fine: true,
        book: true,
        student: true,
      },
    });

    let fineRecord = null;
    if (fineAmount > 0) {
      if (record.fine) {
        fineRecord = await prisma.fine.update({
          where: { id: record.fine.id },
          data: {
            amount: fineAmount,
          },
        });
      } else {
        fineRecord = await prisma.fine.create({
          data: {
            borrowRecordId: record.id,
            amount: fineAmount,
            paidStatus: FineStatus.UNPAID,
          },
        });
      }
    }

    return NextResponse.json({
      message: `Book "${record.book.title}" returned successfully.${
        overdueDays > 0 ? ` Returned ${overdueDays} days late. Fine of $${fineAmount.toFixed(2)} applied.` : ""
      }`,
      record: updatedRecord,
      overdueDays,
      fine: fineRecord,
    });
  } catch (error) {
    console.error("POST /api/borrowings/return error:", error);
    return NextResponse.json({ error: "Failed to process book return" }, { status: 500 });
  }
}
