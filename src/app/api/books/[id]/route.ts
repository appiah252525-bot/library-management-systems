import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookSchema } from "@/lib/validations";
import { requireUserWithRoles } from "@/lib/auth";
import { Role, BorrowStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            student: true,
            fine: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const activeBorrows = book.borrowRecords.filter(
      (r) => r.status === BorrowStatus.BORROWED || r.status === BorrowStatus.OVERDUE
    ).length;

    const availableQuantity = Math.max(0, book.quantity - activeBorrows);

    return NextResponse.json({
      book: {
        ...book,
        activeBorrows,
        availableQuantity,
      },
    });
  } catch (error) {
    console.error("GET /api/books/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
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
    const validatedData = BookSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if new ISBN conflicts with another book
    if (validatedData.data.isbn !== existingBook.isbn) {
      const isbnConflict = await prisma.book.findUnique({
        where: { isbn: validatedData.data.isbn },
      });
      if (isbnConflict) {
        return NextResponse.json(
          { error: "Another book is already registered with this ISBN." },
          { status: 409 }
        );
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id },
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

    return NextResponse.json({ book: updatedBook });
  } catch (error) {
    console.error("PUT /api/books/[id] error:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
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

    // Check if book has active borrow records
    const activeBorrows = await prisma.borrowRecord.count({
      where: {
        bookId: id,
        status: { in: [BorrowStatus.BORROWED, BorrowStatus.OVERDUE] },
      },
    });

    if (activeBorrows > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete book. There are currently ${activeBorrows} active copy/copies borrowed. Please ensure all copies are returned before deletion.`,
        },
        { status: 400 }
      );
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/books/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
