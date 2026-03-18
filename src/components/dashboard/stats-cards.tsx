"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Birds, Wheat, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalBirds: number
    activeFlocks: number
    feedInventory: number
    todayMortality: number
    monthlyRevenue: number
    monthlyExpenses: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const profit = stats.monthlyRevenue - stats.monthlyExpenses

  const cards = [
    {
      title: "Total Birds",
      value: stats.totalBirds.toLocaleString(),
      icon: Birds,
      description: `${stats.activeFlocks} active flocks`,
      trend: "up" as const,
    },
    {
      title: "Feed Inventory",
      value: `${stats.feedInventory.toLocaleString()} kg`,
      icon: Wheat,
      description: "Total stock available",
      trend: stats.feedInventory > 500 ? "up" as const : "down" as const,
    },
    {
      title: "Today's Mortality",
      value: stats.todayMortality.toString(),
      icon: AlertTriangle,
      description: "Birds lost today",
      trend: stats.todayMortality < 10 ? "up" as const : "down" as const,
    },
    {
      title: "Monthly Profit",
      value: `$${Math.abs(profit).toLocaleString()}`,
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      description: profit >= 0 ? "Profit this month" : "Loss this month",
      trend: profit >= 0 ? "up" as const : "down" as const,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.trend === "up" ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.trend === "down" && card.title === "Monthly Profit" ? "text-red-500" : ""}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
