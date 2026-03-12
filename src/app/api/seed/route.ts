import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Check if data already exists
    const existingFarm = await db.farm.findFirst()
    if (existingFarm) {
      return NextResponse.json({ message: "Database already seeded" })
    }

    // Create farm
    const farm = await db.farm.create({
      data: {
        name: "TechChix Poultry Farm",
        location: "Nairobi, Kenya",
        capacity: 10000,
        description: "A modern broiler poultry farm specializing in quality chicken production",
      },
    })

    // Create houses
    const house1 = await db.house.create({
      data: {
        name: "House A",
        capacity: 3000,
        farmId: farm.id,
      },
    })

    const house2 = await db.house.create({
      data: {
        name: "House B",
        capacity: 3500,
        farmId: farm.id,
      },
    })

    const house3 = await db.house.create({
      data: {
        name: "House C",
        capacity: 3500,
        farmId: farm.id,
      },
    })

    // Create flocks
    const flock1 = await db.flock.create({
      data: {
        batchNumber: "B-2024-001",
        startDate: new Date("2024-01-15"),
        initialCount: 2500,
        currentCount: 2380,
        breed: "Cobb 500",
        houseId: house1.id,
        status: "ACTIVE",
        notes: "First batch of the year",
      },
    })

    const flock2 = await db.flock.create({
      data: {
        batchNumber: "B-2024-002",
        startDate: new Date("2024-02-01"),
        initialCount: 3000,
        currentCount: 2890,
        breed: "Ross 308",
        houseId: house2.id,
        status: "ACTIVE",
        notes: "Second batch - Ross breed",
      },
    })

    // Create feeds
    const starterFeed = await db.feed.create({
      data: {
        name: "Broiler Starter Crumbles",
        type: "STARTER",
        quantity: 850,
        unitCost: 1.25,
        reorderLevel: 200,
      },
    })

    const growerFeed = await db.feed.create({
      data: {
        name: "Broiler Grower Pellets",
        type: "GROWER",
        quantity: 1200,
        unitCost: 1.10,
        reorderLevel: 300,
      },
    })

    const finisherFeed = await db.feed.create({
      data: {
        name: "Broiler Finisher Pellets",
        type: "FINISHER",
        quantity: 450,
        unitCost: 1.05,
        reorderLevel: 250,
      },
    })

    // Create medicines/vaccines
    const ndVaccine = await db.medicine.create({
      data: {
        name: "Newcastle Disease Vaccine",
        type: "VACCINE",
        quantity: 500,
        unit: "doses",
        unitCost: 0.15,
        expiryDate: new Date("2025-06-30"),
      },
    })

    const ibVaccine = await db.medicine.create({
      data: {
        name: "Infectious Bronchitis Vaccine",
        type: "VACCINE",
        quantity: 400,
        unit: "doses",
        unitCost: 0.12,
        expiryDate: new Date("2025-05-15"),
      },
    })

    const antibiotic = await db.medicine.create({
      data: {
        name: "Enrofloxacin 10%",
        type: "ANTIBIOTIC",
        quantity: 5,
        unit: "liters",
        unitCost: 45,
        expiryDate: new Date("2025-12-31"),
      },
    })

    // Create daily records
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      await db.dailyRecord.create({
        data: {
          date,
          flockId: flock1.id,
          mortality: Math.floor(Math.random() * 5),
          culled: Math.floor(Math.random() * 2),
          feedConsumed: 150 + Math.random() * 30,
          waterConsumed: 300 + Math.random() * 50,
          avgWeight: 1.2 + Math.random() * 0.3,
        },
      })

      await db.dailyRecord.create({
        data: {
          date,
          flockId: flock2.id,
          mortality: Math.floor(Math.random() * 6),
          culled: Math.floor(Math.random() * 2),
          feedConsumed: 180 + Math.random() * 40,
          waterConsumed: 360 + Math.random() * 60,
          avgWeight: 1.0 + Math.random() * 0.2,
        },
      })
    }

    // Create feed purchases
    await db.feedPurchase.create({
      data: {
        feedId: starterFeed.id,
        quantity: 1000,
        unitCost: 1.25,
        totalCost: 1250,
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        supplier: "FeedMax Ltd",
      },
    })

    // Create feed distributions
    await db.feedDistribution.create({
      data: {
        feedId: starterFeed.id,
        flockId: flock1.id,
        quantity: 150,
        distributedAt: today,
        distributedBy: "Farm Worker",
      },
    })

    await db.feedDistribution.create({
      data: {
        feedId: growerFeed.id,
        flockId: flock2.id,
        quantity: 180,
        distributedAt: today,
        distributedBy: "Farm Worker",
      },
    })

    // Create vaccinations
    await db.vaccination.create({
      data: {
        flockId: flock1.id,
        medicineId: ndVaccine.id,
        vaccinationDate: new Date("2024-01-17"),
        dosage: 1,
        administeredBy: "Dr. John Smith",
      },
    })

    await db.vaccination.create({
      data: {
        flockId: flock2.id,
        medicineId: ndVaccine.id,
        vaccinationDate: new Date("2024-02-03"),
        dosage: 1,
        administeredBy: "Dr. John Smith",
      },
    })

    // Create mortalities
    const causes = ["DISEASE", "HEAT_STRESS", "INJURY", "UNKNOWN", "PREDATION"] as const
    for (let i = 0; i < 15; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      await db.mortality.create({
        data: {
          flockId: Math.random() > 0.5 ? flock1.id : flock2.id,
          date,
          count: Math.floor(Math.random() * 10) + 1,
          cause: causes[Math.floor(Math.random() * causes.length)],
        },
      })
    }

    // Create financial records
    for (let i = 0; i < 20; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6))
      date.setDate(Math.floor(Math.random() * 28) + 1)

      const isIncome = Math.random() > 0.6
      const expenseCategories = ["Feed", "Medicine", "Labor", "Utilities", "Equipment"]
      const incomeCategories = ["Bird Sales", "Manure Sales", "Other"]

      await db.financial.create({
        data: {
          type: isIncome ? "INCOME" : "EXPENSE",
          category: isIncome 
            ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
            : expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
          amount: isIncome ? 2000 + Math.random() * 5000 : 500 + Math.random() * 2000,
          date,
          description: isIncome ? "Bird sales revenue" : "Farm expenses",
          flockId: Math.random() > 0.5 ? flock1.id : flock2.id,
        },
      })
    }

    // Create environment readings
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date()
      timestamp.setHours(timestamp.getHours() - i)

      await db.environmentReading.create({
        data: {
          houseId: house1.id,
          temperature: 22 + Math.random() * 8,
          humidity: 50 + Math.random() * 30,
          co2: 400 + Math.random() * 200,
          ammonia: 5 + Math.random() * 15,
          timestamp,
          source: "manual",
        },
      })
    }

    // Create alerts
    await db.alert.create({
      data: {
        type: "FEED_LOW",
        title: "Low Feed Stock",
        message: "Finisher feed stock is running low (450 kg remaining)",
        priority: "HIGH",
        isRead: false,
      },
    })

    await db.alert.create({
      data: {
        type: "ENVIRONMENT",
        title: "Temperature Alert",
        message: "House A temperature exceeded 30°C",
        priority: "MEDIUM",
        isRead: false,
      },
    })

    await db.alert.create({
      data: {
        type: "VACCINATION",
        title: "Vaccination Due",
        message: "Vaccination due for Flock B-2024-001 in 3 days",
        priority: "MEDIUM",
        isRead: false,
      },
    })

    await db.alert.create({
      data: {
        type: "MORTALITY",
        title: "Mortality Alert",
        message: "Unusual mortality spike detected in House B",
        priority: "HIGH",
        isRead: true,
      },
    })

    return NextResponse.json({ message: "Database seeded successfully" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    )
  }
}
