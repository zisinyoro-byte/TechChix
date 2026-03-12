import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List financial records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const finances = await db.financial.findMany({
      where: {
        ...(type && { type: type as "INCOME" | "EXPENSE" }),
        ...(category && { category }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        flock: {
          select: { batchNumber: true },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(finances)
  } catch (error) {
    console.error("Get financial records error:", error)
    return NextResponse.json(
      { error: "Failed to fetch financial records" },
      { status: 500 }
    )
  }
}

// POST - Create financial record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, category, amount, date, description, flockId, referenceNo } = body

    if (!type || !category || !amount || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const financial = await db.financial.create({
      data: {
        type,
        category,
        amount,
        date: new Date(date),
        description,
        flockId,
        referenceNo,
      },
      include: {
        flock: true,
      },
    })

    return NextResponse.json(financial)
  } catch (error) {
    console.error("Create financial record error:", error)
    return NextResponse.json(
      { error: "Failed to create financial record" },
      { status: 500 }
    )
  }
}

// GET summary - Get financial summary
export async function getSummary(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // month, quarter, year

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const records = await db.financial.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
    })

    const totalIncome = records
      .filter((r) => r.type === "INCOME")
      .reduce((sum, r) => sum + r.amount, 0)

    const totalExpenses = records
      .filter((r) => r.type === "EXPENSE")
      .reduce((sum, r) => sum + r.amount, 0)

    const expensesByCategory = records
      .filter((r) => r.type === "EXPENSE")
      .reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount
        return acc
      }, {} as Record<string, number>)

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      expensesByCategory,
    })
  } catch (error) {
    console.error("Get financial summary error:", error)
    return NextResponse.json(
      { error: "Failed to fetch financial summary" },
      { status: 500 }
    )
  }
}
