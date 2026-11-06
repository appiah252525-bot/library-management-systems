import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FinePaymentSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, FineStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const { id } = await params;
    const body = await req.json();

    const paymentMethod = body.paymentMethod || "Cash (Front Desk)";

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: {
        borrowRecord: {
          include: {
            student: true,
            book: true,
          },
        },
      },
    });

    if (!fine) {
      return NextResponse.json({ error: "Fine record not found" }, { status: 404 });
    }

    if (fine.paidStatus === FineStatus.PAID) {
      return NextResponse.json(
        { error: "This fine has already been paid and settled." },
        { status: 400 }
      );
    }

    const updatedFine = await prisma.fine.update({
      where: { id },
      data: {
        paidStatus: FineStatus.PAID,
        paidAt: new Date(),
        paymentMethod,
      },
      include: {
        borrowRecord: {
          include: {
            student: true,
            book: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Fine of $${fine.amount.toFixed(2)} marked as PAID.`,
      fine: updatedFine,
    });
  } catch (error) {
    console.error("PATCH /api/fines/[id]/pay error:", error);
    return NextResponse.json({ error: "Failed to settle fine" }, { status: 500 });
  }
}
