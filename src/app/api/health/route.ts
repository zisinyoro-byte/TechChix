import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - List medicines/vaccines or vaccinations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // medicine, vaccination, mortality

    if (type === "vaccination") {
      const vaccinations = await db.vaccination.findMany({
        include: {
          flock: {
            select: { batchNumber: true, breed: true },
          },
          medicine: true,
        },
        orderBy: { vaccinationDate: "desc" },
      })
      return NextResponse.json(vaccinations)
    }

    if (type === "mortality") {
      const mortalities = await db.mortality.findMany({
        include: {
          flock: {
            select: { batchNumber: true, breed: true },
          },
        },
        orderBy: { date: "desc" },
      })
      return NextResponse.json(mortalities)
    }

    // Default: return medicines
    const medicines = await db.medicine.findMany({
      orderBy: { name: "asc" },
    })

    const medicinesWithStatus = medicines.map((med) => ({
      ...med,
      isLowStock: med.quantity <= med.reorderLevel,
      isExpiringSoon: med.expiryDate && 
        new Date(med.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    }))

    return NextResponse.json(medicinesWithStatus)
  } catch (error) {
    console.error("Get health data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 }
    )
  }
}

// POST - Create vaccination, mortality, or medicine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordType } = body

    if (recordType === "vaccination") {
      const { flockId, medicineId, vaccinationDate, dosage, administeredBy, method, notes, nextDueDate } = body

      if (!flockId || !medicineId || !vaccinationDate) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      const vaccination = await db.vaccination.create({
        data: {
          flockId,
          medicineId,
          vaccinationDate: new Date(vaccinationDate),
          dosage: dosage || 1,
          administeredBy,
          method,
          notes,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        },
        include: {
          flock: true,
          medicine: true,
        },
      })

      return NextResponse.json(vaccination)
    }

    if (recordType === "mortality") {
      const { flockId, date, count, cause, description, notes } = body

      if (!flockId || !date || !count || !cause) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      const mortality = await db.mortality.create({
        data: {
          flockId,
          date: new Date(date),
          count,
          cause,
          description,
          notes,
        },
        include: {
          flock: true,
        },
      })

      // Update flock current count
      await db.flock.update({
        where: { id: flockId },
        data: {
          currentCount: {
            decrement: count,
          },
        },
      })

      // Create alert if high mortality
      if (count >= 10) {
        await db.alert.create({
          data: {
            type: "MORTALITY",
            title: "High Mortality Alert",
            message: `${count} birds died in flock ${mortality.flock?.batchNumber || "unknown"} due to ${cause}`,
            priority: count >= 20 ? "CRITICAL" : "HIGH",
            flockId,
          },
        })
      }

      return NextResponse.json(mortality)
    }

    // Default: create medicine
    const { name, type, quantity, unit, unitCost, expiryDate, reorderLevel } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const medicine = await db.medicine.create({
      data: {
        name,
        type,
        quantity: quantity || 0,
        unit: unit || "units",
        unitCost: unitCost || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        reorderLevel: reorderLevel || 10,
      },
    })

    return NextResponse.json(medicine)
  } catch (error) {
    console.error("Create health record error:", error)
    return NextResponse.json(
      { error: "Failed to create health record" },
      { status: 500 }
    )
  }
}
