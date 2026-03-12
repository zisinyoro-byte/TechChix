import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List houses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get("farmId")

    const houses = await db.house.findMany({
      where: {
        ...(farmId && { farmId }),
      },
      include: {
        farm: true,
        flocks: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            batchNumber: true,
            currentCount: true,
          },
        },
        _count: {
          select: { flocks: true },
        },
      },
      orderBy: { name: "asc" },
    })

    const housesWithOccupancy = houses.map((house) => {
      const occupiedCount = house.flocks.reduce((sum, f) => sum + f.currentCount, 0)
      return {
        ...house,
        occupiedCount,
        occupancyRate: house.capacity > 0 ? (occupiedCount / house.capacity) * 100 : 0,
        availableCapacity: house.capacity - occupiedCount,
      }
    })

    return NextResponse.json(housesWithOccupancy)
  } catch (error) {
    console.error("Get houses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch houses" },
      { status: 500 }
    )
  }
}

// POST - Create house
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, capacity, farmId } = body

    if (!name || !farmId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const house = await db.house.create({
      data: {
        name,
        capacity: capacity || 0,
        farmId,
      },
      include: {
        farm: true,
      },
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error("Create house error:", error)
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    )
  }
}
