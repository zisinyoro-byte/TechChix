"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Thermometer,
  Wheat,
  DollarSign,
  HeartPulse,
  X,
} from "lucide-react"

interface Alert {
  id: string
  type: "mortality" | "feed" | "environment" | "health" | "financial"
  message: string
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  createdAt: Date
}

interface AlertsProps {
  alerts: Alert[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
}

const alertIcons = {
  mortality: AlertTriangle,
  feed: Wheat,
  environment: Thermometer,
  health: HeartPulse,
  financial: DollarSign,
}

const priorityColors = {
  low: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function Alerts({ alerts, onMarkAsRead, onDismiss }: AlertsProps) {
  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>System notifications and warnings</CardDescription>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
            <p>No alerts at this time</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const Icon = alertIcons[alert.type]
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      alert.isRead ? "bg-background" : "bg-muted/50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        priorityColors[alert.priority]
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge
                          variant="outline"
                          className={`${priorityColors[alert.priority]} text-xs`}
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(alert.createdAt)}
                      </p>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMarkAsRead?.(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onDismiss?.(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
