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

// POST - Create new feed or distribute feed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle feed distribution
    if (body.action === "distribute") {
      const { feedId, flockId, quantity, distributedAt, distributedBy, notes } = body
      
      if (!feedId || !flockId || !quantity) {
        return NextResponse.json(
          { error: "Missing required fields for distribution" },
          { status: 400 }
        )
      }

      // Check if feed has enough quantity
      const feed = await db.feed.findUnique({ where: { id: feedId } })
      if (!feed) {
        return NextResponse.json({ error: "Feed not found" }, { status: 404 })
      }
      
      if (feed.quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient feed stock. Available: ${feed.quantity} kg` },
          { status: 400 }
        )
      }

      // Create distribution and update feed quantity in transaction
      const [distribution] = await db.$transaction([
        db.feedDistribution.create({
          data: {
            feedId,
            flockId,
            quantity,
            distributedAt: distributedAt ? new Date(distributedAt) : new Date(),
            distributedBy,
            notes,
          },
          include: {
            feed: true,
            flock: { select: { batchNumber: true } },
          },
        }),
        db.feed.update({
          where: { id: feedId },
          data: { quantity: { decrement: quantity } },
        }),
      ])

      return NextResponse.json(distribution)
    }
    
    // Handle feed purchase
    if (body.action === "purchase") {
      const { feedId, quantity, unitCost, totalCost, supplier, invoiceNo, notes } = body
      
      if (!feedId || !quantity) {
        return NextResponse.json(
          { error: "Missing required fields for purchase" },
          { status: 400 }
        )
      }

      const [purchase] = await db.$transaction([
        db.feedPurchase.create({
          data: {
            feedId,
            quantity,
            unitCost: unitCost || 0,
            totalCost: totalCost || 0,
            purchaseDate: new Date(),
            supplier,
            invoiceNo,
            notes,
          },
        }),
        db.feed.update({
          where: { id: feedId },
          data: { quantity: { increment: quantity } },
        }),
      ])

      return NextResponse.json(purchase)
    }
    
    // Create new feed type
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
    console.error("Feed operation error:", error)
    return NextResponse.json(
      { error: "Failed to process feed operation" },
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
