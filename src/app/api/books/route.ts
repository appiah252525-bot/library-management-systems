import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { isbn: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      whereClause.category = category;
    }

    const [totalItems, books] = await Promise.all([
      prisma.book.count({ where: whereClause }),
      prisma.book.findMany({
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
        },
      }),
    ]);

    // Calculate availableQuantity for each book
    const enrichedBooks = books.map((book) => {
      const activeBorrows = book.borrowRecords.length;
      const availableQuantity = Math.max(0, book.quantity - activeBorrows);
      const { borrowRecords, ...rest } = book;
      return {
        ...rest,
        activeBorrows,
        availableQuantity,
      };
    });

    return NextResponse.json({
      books: enrichedBooks,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/books error:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireUserWithRoles([Role.ADMIN, Role.LIBRARIAN]);
    if (!authCheck.authorized) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validatedData = BookSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingIsbn = await prisma.book.findUnique({
      where: { isbn: validatedData.data.isbn },
    });

    if (existingIsbn) {
      return NextResponse.json(
        { error: "A book with this ISBN already exists in the system." },
        { status: 409 }
      );
    }

    const newBook = await prisma.book.create({
      data: {
        title: validatedData.data.title,
        author: validatedData.data.author,
        isbn: validatedData.data.isbn,
        category: validatedData.data.category,
        publisher: validatedData.data.publisher,
        publicationYear: validatedData.data.publicationYear,
        quantity: validatedData.data.quantity,
        coverImage: validatedData.data.coverImage || null,
        description: validatedData.data.description || null,
      },
    });

    return NextResponse.json({ book: newBook }, { status: 201 });
  } catch (error) {
    console.error("POST /api/books error:", error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}
