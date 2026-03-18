import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List environment readings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const houseId = searchParams.get("houseId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const readings = await db.environmentReading.findMany({
      where: {
        ...(houseId && { houseId }),
        ...(startDate && endDate && {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        house: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json(readings)
  } catch (error) {
    console.error("Get environment readings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch environment readings" },
      { status: 500 }
    )
  }
}

// POST - Create environment reading
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { houseId, temperature, humidity, co2, ammonia, light, source } = body

    if (!houseId) {
      return NextResponse.json(
        { error: "House ID is required" },
        { status: 400 }
      )
    }

    const reading = await db.environmentReading.create({
      data: {
        houseId,
        temperature,
        humidity,
        co2,
        ammonia,
        light,
        source: source || "manual",
      },
      include: {
        house: true,
      },
    })

    // Check for alerts
    if (temperature && temperature > 32) {
      await db.alert.create({
        data: {
          type: "ENVIRONMENT",
          title: "High Temperature Alert",
          message: `Temperature in ${reading.house?.name || "unknown"} is ${temperature}°C`,
          priority: temperature > 35 ? "CRITICAL" : "HIGH",
          houseId,
        },
      })
    }

    if (humidity && humidity > 80) {
      await db.alert.create({
        data: {
          type: "ENVIRONMENT",
          title: "High Humidity Alert",
          message: `Humidity in ${reading.house?.name || "unknown"} is ${humidity}%`,
          priority: "MEDIUM",
          houseId,
        },
      })
    }

    if (ammonia && ammonia > 25) {
      await db.alert.create({
        data: {
          type: "ENVIRONMENT",
          title: "High Ammonia Alert",
          message: `Ammonia level in ${reading.house?.name || "unknown"} is ${ammonia} ppm`,
          priority: ammonia > 35 ? "CRITICAL" : "HIGH",
          houseId,
        },
      })
    }

    return NextResponse.json(reading)
  } catch (error) {
    console.error("Create environment reading error:", error)
    return NextResponse.json(
      { error: "Failed to create environment reading" },
      { status: 500 }
    )
  }
}
