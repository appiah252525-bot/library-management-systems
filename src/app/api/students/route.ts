import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StudentSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const department = searchParams.get("department") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { studentNumber: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (department && department !== "All") {
      whereClause.department = department;
    }

    const [totalItems, students] = await Promise.all([
      prisma.student.count({ where: whereClause }),
      prisma.student.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          borrowRecords: {
            where: {
              status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
            },
            select: { id: true },
          },
          _count: {
            select: { borrowRecords: true },
          },
        },
      }),
    ]);

    const enrichedStudents = students.map((s) => ({
      ...s,
      activeBorrowsCount: s.borrowRecords.length,
    }));

    return NextResponse.json({
      students: enrichedStudents,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validatedData = StudentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check unique studentNumber
    const existingStudentNum = await prisma.student.findUnique({
      where: { studentNumber: validatedData.data.studentNumber },
    });
    if (existingStudentNum) {
      return NextResponse.json(
        { error: "A student with this Student ID already exists." },
        { status: 409 }
      );
    }

    // Check unique email
    const existingEmail = await prisma.student.findUnique({
      where: { email: validatedData.data.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A student with this email address already exists." },
        { status: 409 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        studentNumber: validatedData.data.studentNumber,
        fullName: validatedData.data.fullName,
        department: validatedData.data.department,
        email: validatedData.data.email,
        phone: validatedData.data.phone,
      },
    });

    return NextResponse.json({ student: newStudent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
