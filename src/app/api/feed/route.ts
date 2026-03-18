import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List all feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const feeds = await db.feed.findMany({
      where: {
        ...(type && { type: type as "STARTER" | "GROWER" | "FINISHER" | "PRE_STARTER" | "CONCENTRATE" }),
      },
      include: {
        purchases: {
          orderBy: { purchaseDate: "desc" },
          take: 5,
        },
        distributions: {
          include: {
            flock: {
              select: { batchNumber: true },
            },
          },
          orderBy: { distributedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    })

    // Add low stock flag
    const feedsWithStatus = feeds.map((feed) => ({
      ...feed,
      isLowStock: feed.quantity <= feed.reorderLevel,
    }))

    return NextResponse.json(feedsWithStatus)
  } catch (error) {
    console.error("Get feeds error:", error)
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    )
  }
}

// POST - Create new feed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, quantity, unitCost, reorderLevel } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const feed = await db.feed.create({
      data: {
        name,
        type,
        quantity: quantity || 0,
        unitCost: unitCost || 0,
        reorderLevel: reorderLevel || 50,
      },
    })

    return NextResponse.json(feed)
  } catch (error) {
    console.error("Create feed error:", error)
    return NextResponse.json(
      { error: "Failed to create feed" },
      { status: 500 }
    )
  }
}

// PUT - Update feed quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity } = body

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const feed = await db.feed.update({
      where: { id },
      data: { quantity },
    })

    return NextResponse.json(feed)
  } catch (error) {
    console.error("Update feed error:", error)
    return NextResponse.json(
      { error: "Failed to update feed" },
      { status: 500 }
    )
  }
}
