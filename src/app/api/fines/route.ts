import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FineStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.paidStatus = status as FineStatus;
    }

    if (q) {
      whereClause.borrowRecord = {
        OR: [
          { student: { fullName: { contains: q, mode: "insensitive" } } },
          { student: { studentNumber: { contains: q, mode: "insensitive" } } },
          { book: { title: { contains: q, mode: "insensitive" } } },
        ],
      };
    }

    const [totalItems, fines, totalUnpaidSum, totalPaidSum] = await Promise.all([
      prisma.fine.count({ where: whereClause }),
      prisma.fine.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          borrowRecord: {
            include: {
              student: true,
              book: true,
            },
          },
        },
      }),
      prisma.fine.aggregate({
        where: { paidStatus: FineStatus.UNPAID },
        _sum: { amount: true },
      }),
      prisma.fine.aggregate({
        where: { paidStatus: FineStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      fines,
      summary: {
        totalUnpaidAmount: totalUnpaidSum._sum.amount || 0,
        totalPaidAmount: totalPaidSum._sum.amount || 0,
      },
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/fines error:", error);
    return NextResponse.json({ error: "Failed to fetch fines" }, { status: 500 });
  }
}
