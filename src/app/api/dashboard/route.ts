import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection first
    const farm = await db.farm.findFirst()
    if (!farm) {
      return NextResponse.json({ 
        error: "No farm found. Please seed the database first using /api/seed",
        message: "Seeding required",
      })
    }
    
    // Continue with existing data fetch...
    const activeFlocks = await db.flock.findMany({
      where: { status: "ACTIVE" },
      select: { currentCount: true, batchNumber: true },
    })
    const totalBirds = activeFlocks.reduce((sum, flock) => sum + flock.currentCount, 00)

    // Get feed inventory
    const feeds = await db.feed.findMany({
      select: { quantity: true, name: true },
    })
    const feedInventory = feeds.reduce((sum, feed) => sum + feed.quantity, 0)

    // Get today's mortality
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayMortality = await db.mortality.aggregate({
      where: {
        date: {
          gte: today,
        },
      },
      _sum: {
        count: true,
      },
    })

    // Get weekly mortality
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyMortality = await db.mortality.aggregate({
      where: {
        date: {
          gte: weekAgo,
        },
      },
      _sum: {
        count: true,
      },
    })

    // Get monthly financial data
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlyFinancials = await db.financial.groupBy({
      by: ["type"],
      where: {
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const monthlyRevenue = monthlyFinancials.find((f) => f.type === "INCOME")?._sum.amount || 0
    const monthlyExpenses = monthlyFinancials.find((f) => f.type === "EXPENSE")?._sum.amount || 0

    // Get flock growth data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyRecords = await db.dailyRecord.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        flock: {
          select: { batchNumber: true },
        },
      },
      orderBy: { date: "asc" },
    })

    // Aggregate mortality by date
    const mortalityByDate = new Map<string, number>()
    dailyRecords.forEach((record) => {
      const dateStr = record.date.toISOString().split("T")[0]
      mortalityByDate.set(dateStr, (mortalityByDate.get(dateStr) || 0) + record.mortality)
    })

    // Create flock growth data
    const flockGrowth = []
    let runningCount = totalBirds
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayMortality = mortalityByDate.get(dateStr) || 0
      
      flockGrowth.push({
        date: dateStr.slice(5),
        count: runningCount,
      })
      runningCount += dayMortality
    }

    // Get feed consumption by flock
    const feedDistributions = await db.feedDistribution.findMany({
      where: {
        distributedAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        flock: {
          select: { batchNumber: true },
        },
      },
    })

    const feedConsumptionMap = new Map<string, number>()
    feedDistributions.forEach((d) => {
      const name = d.flock?.batchNumber || "Unknown"
      feedConsumptionMap.set(name, (feedConsumptionMap.get(name) || 0) + d.quantity)
    })

    const feedConsumption = Array.from(feedConsumptionMap.entries())
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5)

    // Get mortality breakdown by cause
    const mortalities = await db.mortality.groupBy({
      by: ["cause"],
      _sum: {
        count: true,
      },
    })

    const mortalityBreakdown = mortalities.map((m) => ({
      name: m.cause.charAt(0) + m.cause.slice(1).toLowerCase().replace(/_/g, " "),
      value: m._sum.count || 0,
    }))

    // Get financial overview for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const financialRecords = await db.financial.findMany({
      where: {
        date: {
          gte: sixMonthsAgo,
        },
      },
    })

    const monthlyData = new Map<string, { revenue: number; expenses: number }>()
    financialRecords.forEach((r) => {
      const month = r.date.toISOString().slice(0, 7)
      const data = monthlyData.get(month) || { revenue: 0, expenses: 0 }
      if (r.type === "INCOME") {
        data.revenue += r.amount
      } else {
        data.expenses += r.amount
      }
      monthlyData.set(month, data)
    })

    const financialOverview = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
        ...data,
      }))
      .slice(-6)

    // Get recent alerts
    const alerts = await db.alert.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    // Get environment data for last 24 hours
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    
    const environmentReadings = await db.environmentReading.findMany({
      where: {
        timestamp: {
          gte: yesterday,
        },
      },
      include: {
        house: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: "asc" },
    })

    const environmentData = environmentReadings.map((r) => ({
      time: r.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      temperature: r.temperature,
      humidity: r.humidity,
      house: r.house?.name,
    }))

    return NextResponse.json({
      stats: {
        totalBirds,
        activeFlocks: activeFlocks.length,
        feedInventory,
        todayMortality: todayMortality._sum.count || 0,
        weeklyMortality: weeklyMortality._sum.count || 0,
        monthlyRevenue,
        monthlyExpenses,
        profit: monthlyRevenue - monthlyExpenses,
      },
      charts: {
        flockGrowth,
        feedConsumption,
        mortalityBreakdown,
        financialOverview,
        environmentData,
      },
      alerts,
      flocks: activeFlocks,
    })
  } catch (error: unknown) {
    console.error("Dashboard API error:", error)
    // Provide more detailed error message
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
 finally {
  if (error) {
    console.error("Dashboard API error finally:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" })
  }
}
