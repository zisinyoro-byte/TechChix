import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List daily records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const flockId = searchParams.get("flockId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const records = await db.dailyRecord.findMany({
      where: {
        ...(flockId && { flockId }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        flock: {
          select: {
            batchNumber: true,
            breed: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Get daily records error:", error)
    return NextResponse.json(
      { error: "Failed to fetch daily records" },
      { status: 500 }
    )
  }
}

// POST - Create daily record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      flockId,
      date,
      mortality,
      culled,
      feedConsumed,
      waterConsumed,
      avgWeight,
      temperature,
      humidity,
      notes,
    } = body

    // Validate required fields
    if (!flockId || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if record already exists for this date
    const existingRecord = await db.dailyRecord.findUnique({
      where: {
        flockId_date: {
          flockId,
          date: new Date(date),
        },
      },
    })

    if (existingRecord) {
      // Update existing record
      const updated = await db.dailyRecord.update({
        where: { id: existingRecord.id },
        data: {
          mortality: mortality || 0,
          culled: culled || 0,
          feedConsumed: feedConsumed || 0,
          waterConsumed: waterConsumed || 0,
          avgWeight,
          temperature,
          humidity,
          notes,
        },
      })

      // Update flock current count
      if (mortality || culled) {
        await db.flock.update({
          where: { id: flockId },
          data: {
            currentCount: {
              decrement: (mortality || 0) + (culled || 0),
            },
          },
        })
      }

      return NextResponse.json(updated)
    }

    // Create new record
    const record = await db.dailyRecord.create({
      data: {
        flockId,
        date: new Date(date),
        mortality: mortality || 0,
        culled: culled || 0,
        feedConsumed: feedConsumed || 0,
        waterConsumed: waterConsumed || 0,
        avgWeight,
        temperature,
        humidity,
        notes,
      },
    })

    // Update flock current count
    if (mortality || culled) {
      await db.flock.update({
        where: { id: flockId },
        data: {
          currentCount: {
            decrement: (mortality || 0) + (culled || 0),
          },
        },
      })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Create daily record error:", error)
    return NextResponse.json(
      { error: "Failed to create daily record" },
      { status: 500 }
    )
  }
}
