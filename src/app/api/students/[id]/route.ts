import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StudentSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus, FineStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          orderBy: { createdAt: "desc" },
          include: {
            book: true,
            fine: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const activeBorrows = student.borrowRecords.filter(
      (r) => r.status === BorrowStatus.BORROWED || r.status === BorrowStatus.OVERDUE
    );

    const unpaidFines = student.borrowRecords
      .filter((r) => r.fine && r.fine.paidStatus === FineStatus.UNPAID)
      .reduce((sum, r) => sum + (r.fine?.amount || 0), 0);

    return NextResponse.json({
      student: {
        ...student,
        activeBorrowsCount: activeBorrows.length,
        unpaidFinesTotal: unpaidFines,
      },
    });
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(
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
    const validatedData = StudentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check unique studentNumber if changed
    if (validatedData.data.studentNumber !== existingStudent.studentNumber) {
      const conflict = await prisma.student.findUnique({
        where: { studentNumber: validatedData.data.studentNumber },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "A student with this Student ID already exists." },
          { status: 409 }
        );
      }
    }

    // Check unique email if changed
    if (validatedData.data.email !== existingStudent.email) {
      const conflict = await prisma.student.findUnique({
        where: { email: validatedData.data.email },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "A student with this email address already exists." },
          { status: 409 }
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        studentNumber: validatedData.data.studentNumber,
        fullName: validatedData.data.fullName,
        department: validatedData.data.department,
        email: validatedData.data.email,
        phone: validatedData.data.phone,
      },
    });

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const { id } = await params;

    // Check if student has active borrow records
    const activeBorrows = await prisma.borrowRecord.count({
      where: {
        studentId: id,
        status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
      },
    });

    if (activeBorrows > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete student. The student currently has ${activeBorrows} unreturned book(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student record deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
