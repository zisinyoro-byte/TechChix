import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List all flocks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const houseId = searchParams.get("houseId")

    const flocks = await db.flock.findMany({
      where: {
        ...(status && { status: status as "ACTIVE" | "COMPLETED" | "CANCELLED" }),
        ...(houseId && { houseId }),
      },
      include: {
        house: {
          include: {
            farm: true,
          },
        },
        dailyRecords: {
          orderBy: { date: "desc" },
          take: 7,
        },
        mortalities: {
          orderBy: { date: "desc" },
          take: 5,
        },
        vaccinations: {
          include: {
            medicine: true,
          },
          orderBy: { vaccinationDate: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(flocks)
  } catch (error) {
    console.error("Get flocks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch flocks" },
      { status: 500 }
    )
  }
}

// POST - Create new flock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchNumber, breed, startDate, initialCount, houseId, notes } = body

    // Validate required fields
    if (!batchNumber || !breed || !startDate || !initialCount || !houseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if batch number already exists
    const existingFlock = await db.flock.findUnique({
      where: { batchNumber },
    })

    if (existingFlock) {
      return NextResponse.json(
        { error: "Batch number already exists" },
        { status: 400 }
      )
    }

    const flock = await db.flock.create({
      data: {
        batchNumber,
        breed,
        startDate: new Date(startDate),
        initialCount,
        currentCount: initialCount,
        houseId,
        notes,
        status: "ACTIVE",
      },
      include: {
        house: true,
      },
    })

    return NextResponse.json(flock)
  } catch (error) {
    console.error("Create flock error:", error)
    return NextResponse.json(
      { error: "Failed to create flock" },
      { status: 500 }
    )
  }
}
