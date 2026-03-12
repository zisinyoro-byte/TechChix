"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Bird,
  Wheat,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Thermometer,
  Droplets,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
  Home,
  HeartPulse,
  Wallet,
  Settings,
  BarChart3,
  Calendar,
  Bell,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Types
interface DashboardStats {
  totalBirds: number
  activeFlocks: number
  feedInventory: number
  todayMortality: number
  weeklyMortality: number
  monthlyRevenue: number
  monthlyExpenses: number
  profit: number
}

interface Alert {
  id: string
  type: string
  title: string
  message: string
  priority: string
  isRead: boolean
  createdAt: string
}

interface Flock {
  id: string
  batchNumber: string
  breed: string
  currentCount: number
  initialCount: number
  startDate: string
  status: string
}

interface House {
  id: string
  name: string
  capacity: number
  occupiedCount: number
  occupancyRate: number
}

// Color palette
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
}

export default function TechChixDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [charts, setCharts] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showNewFlockDialog, setShowNewFlockDialog] = useState(false)
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false)
  const { toast } = useToast()

  // Form states
  const [newFlock, setNewFlock] = useState({
    batchNumber: "",
    breed: "",
    startDate: "",
    initialCount: 0,
    houseId: "",
    notes: "",
  })

  const [newRecord, setNewRecord] = useState({
    flockId: "",
    date: new Date().toISOString().split("T")[0],
    mortality: 0,
    culled: 0,
    feedConsumed: 0,
    waterConsumed: 0,
    avgWeight: 0,
    notes: "",
  })

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setStats(data.stats)
      setCharts(data.charts)
      setAlerts(data.alerts)
      setFlocks(data.flocks)
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch houses
  const fetchHouses = async () => {
    try {
      const res = await fetch("/api/houses")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setHouses(data)
    } catch (error) {
      console.error("Error fetching houses:", error)
    }
  }

  // Seed database
  const seedDatabase = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" })
      const data = await res.json()
      toast({
        title: "Success",
        description: data.message,
      })
      fetchDashboard()
      fetchHouses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      })
    }
  }

  // Create new flock
  const createFlock = async () => {
    try {
      const res = await fetch("/api/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlock),
      })
      if (!res.ok) throw new Error("Failed to create")
      toast({
        title: "Success",
        description: "Flock created successfully",
      })
      setShowNewFlockDialog(false)
      setNewFlock({
        batchNumber: "",
        breed: "",
        startDate: "",
        initialCount: 0,
        houseId: "",
        notes: "",
      })
      fetchDashboard()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flock",
        variant: "destructive",
      })
    }
  }

  // Create daily record
  const createDailyRecord = async () => {
    try {
      const res = await fetch("/api/daily-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      })
      if (!res.ok) throw new Error("Failed to create")
      toast({
        title: "Success",
        description: "Daily record saved successfully",
      })
      setShowNewRecordDialog(false)
      setNewRecord({
        flockId: "",
        date: new Date().toISOString().split("T")[0],
        mortality: 0,
        culled: 0,
        feedConsumed: 0,
        waterConsumed: 0,
        avgWeight: 0,
        notes: "",
      })
      fetchDashboard()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save daily record",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchHouses()
  }, [])

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "flocks", icon: Bird, label: "Flocks" },
    { id: "feed", icon: Wheat, label: "Feed Management" },
    { id: "health", icon: HeartPulse, label: "Health & Vaccination" },
    { id: "financial", icon: Wallet, label: "Financial" },
    { id: "environment", icon: Thermometer, label: "Environment" },
    { id: "reports", icon: BarChart3, label: "Reports" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 z-50"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Bird className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">TechChix</h1>
                <p className="text-xs text-slate-400">Broiler Management</p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-600"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30">
              <p className="text-sm text-slate-300">Need help?</p>
              <p className="text-xs text-slate-400 mt-1">Check our documentation</p>
              <Button variant="link" className="text-emerald-400 p-0 mt-2 text-sm">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main
        className="transition-all duration-300 p-6"
        style={{ marginLeft: sidebarOpen ? 280 : 80 }}
      >
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome back! Here's your farm overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={seedDatabase}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Seed Demo Data
            </Button>
            <Dialog open={showNewFlockDialog} onOpenChange={setShowNewFlockDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Flock
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Flock</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new batch of broilers to your farm.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Batch Number</Label>
                      <Input
                        placeholder="B-2024-003"
                        value={newFlock.batchNumber}
                        onChange={(e) => setNewFlock({ ...newFlock, batchNumber: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Breed</Label>
                      <Input
                        placeholder="Cobb 500"
                        value={newFlock.breed}
                        onChange={(e) => setNewFlock({ ...newFlock, breed: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Start Date</Label>
                      <Input
                        type="date"
                        value={newFlock.startDate}
                        onChange={(e) => setNewFlock({ ...newFlock, startDate: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Initial Count</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={newFlock.initialCount}
                        onChange={(e) => setNewFlock({ ...newFlock, initialCount: parseInt(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">House</Label>
                    <Select value={newFlock.houseId} onValueChange={(value) => setNewFlock({ ...newFlock, houseId: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select house" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {houses.map((house) => (
                          <SelectItem key={house.id} value={house.id} className="text-white">
                            {house.name} (Capacity: {house.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Notes</Label>
                    <Textarea
                      placeholder="Optional notes..."
                      value={newFlock.notes}
                      onChange={(e) => setNewFlock({ ...newFlock, notes: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button onClick={createFlock} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                    Create Flock
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-emerald-400">Total Birds</CardDescription>
                      <CardTitle className="text-3xl text-white">{stats?.totalBirds.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <Bird className="w-4 h-4" />
                        <span>{stats?.activeFlocks} Active Flocks</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/30 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-400">Feed Inventory</CardDescription>
                      <CardTitle className="text-3xl text-white">{stats?.feedInventory.toLocaleString()} kg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <Wheat className="w-4 h-4" />
                        <span>Stock available</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-600/20 to-red-600/5 border-red-500/30 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-red-400">Today's Mortality</CardDescription>
                      <CardTitle className="text-3xl text-white">{stats?.todayMortality}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <TrendingDown className="w-4 h-4" />
                        <span>{stats?.weeklyMortality} this week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 border-cyan-500/30 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-cyan-400">Monthly Profit</CardDescription>
                      <CardTitle className="text-3xl text-white">${stats?.profit.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-cyan-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>${stats?.monthlyRevenue.toLocaleString()} revenue</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Flock Growth Chart */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white">Bird Population Trend</CardTitle>
                      <CardDescription className="text-slate-400">Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={charts?.flockGrowth}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorCount)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Feed Consumption */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white">Feed Consumption by Flock</CardTitle>
                      <CardDescription className="text-slate-400">Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={charts?.feedConsumption}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                          />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mortality Breakdown */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white">Mortality Causes</CardTitle>
                      <CardDescription className="text-slate-400">Breakdown by cause</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={charts?.mortalityBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {charts?.mortalityBreakdown?.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {charts?.mortalityBreakdown?.map((item: any, index: number) => (
                          <div key={item.name} className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Overview */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white">Financial Overview</CardTitle>
                      <CardDescription className="text-slate-400">Revenue vs Expenses (6 months)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={charts?.financialOverview}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Alerts & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alerts */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          Recent Alerts
                        </CardTitle>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {alerts.filter((a) => !a.isRead).length} New
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {alerts.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No alerts</p>
                            </div>
                          ) : (
                            alerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={`p-3 rounded-lg border ${
                                  alert.isRead ? "bg-slate-700/30 border-slate-600" : "bg-slate-700/50 border-slate-500"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${priorityColors[alert.priority]}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-white">{alert.title}</span>
                                      <span className="text-xs text-slate-400">
                                        {new Date(alert.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                      <CardDescription className="text-slate-400">Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-20 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-emerald-500"
                            >
                              <Activity className="w-5 h-5 text-emerald-500" />
                              <span className="text-slate-300">Add Daily Record</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Daily Record Entry</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Record today's flock performance data.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label className="text-slate-300">Flock</Label>
                                <Select value={newRecord.flockId} onValueChange={(value) => setNewRecord({ ...newRecord, flockId: value })}>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Select flock" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    {flocks.map((flock) => (
                                      <SelectItem key={flock.id} value={flock.id} className="text-white">
                                        {flock.batchNumber} ({flock.currentCount} birds)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-slate-300">Date</Label>
                                  <Input
                                    type="date"
                                    value={newRecord.date}
                                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-slate-300">Mortality</Label>
                                  <Input
                                    type="number"
                                    value={newRecord.mortality}
                                    onChange={(e) => setNewRecord({ ...newRecord, mortality: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-slate-300">Feed Consumed (kg)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={newRecord.feedConsumed}
                                    onChange={(e) => setNewRecord({ ...newRecord, feedConsumed: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-slate-300">Water Consumed (L)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={newRecord.waterConsumed}
                                    onChange={(e) => setNewRecord({ ...newRecord, waterConsumed: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-slate-300">Avg Weight (kg)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={newRecord.avgWeight}
                                    onChange={(e) => setNewRecord({ ...newRecord, avgWeight: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-slate-300">Culled</Label>
                                  <Input
                                    type="number"
                                    value={newRecord.culled}
                                    onChange={(e) => setNewRecord({ ...newRecord, culled: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                              <Button onClick={createDailyRecord} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                                Save Record
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          className="h-20 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-blue-500"
                        >
                          <Wheat className="w-5 h-5 text-blue-500" />
                          <span className="text-slate-300">Record Feed</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-purple-500"
                        >
                          <HeartPulse className="w-5 h-5 text-purple-500" />
                          <span className="text-slate-300">Add Vaccination</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-cyan-500"
                        >
                          <Wallet className="w-5 h-5 text-cyan-500" />
                          <span className="text-slate-300">Add Transaction</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Flocks */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Active Flocks</CardTitle>
                      <Button variant="link" className="text-emerald-400">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Batch</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Breed</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Birds</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Started</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Survival</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flocks.map((flock) => (
                            <tr key={flock.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="py-3 px-4">
                                <span className="font-medium text-white">{flock.batchNumber}</span>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{flock.breed}</td>
                              <td className="py-3 px-4 text-slate-300">{flock.currentCount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-slate-300">
                                {new Date(flock.startDate).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(flock.currentCount / flock.initialCount) * 100}
                                    className="w-20 h-2"
                                  />
                                  <span className="text-slate-400 text-sm">
                                    {((flock.currentCount / flock.initialCount) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className="bg-emerald-600 text-white">
                                  {flock.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "flocks" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Tabs defaultValue="active" className="space-y-4">
                  <TabsList className="bg-slate-800 border-slate-700">
                    <TabsTrigger value="active" className="data-[state=active]:bg-emerald-600">Active Flocks</TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600">Completed</TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600">All Flocks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {flocks.map((flock) => (
                        <Card key={flock.id} className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white">{flock.batchNumber}</CardTitle>
                              <Badge className="bg-emerald-600">{flock.status}</Badge>
                            </div>
                            <CardDescription className="text-slate-400">{flock.breed}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-500">Current Count</p>
                                <p className="text-lg font-semibold text-white">{flock.currentCount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Initial Count</p>
                                <p className="text-lg font-semibold text-white">{flock.initialCount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Survival Rate</p>
                              <Progress value={(flock.currentCount / flock.initialCount) * 100} className="h-2" />
                              <p className="text-xs text-slate-400 mt-1">
                                {((flock.currentCount / flock.initialCount) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <Button variant="outline" className="w-full border-slate-600 hover:border-emerald-500">
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="py-12 text-center">
                        <Bird className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">No Completed Flocks</h3>
                        <p className="text-slate-400 mt-1">Completed flocks will appear here</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="all">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">All Flocks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-slate-400">Batch #</th>
                                <th className="text-left py-3 px-4 text-slate-400">Breed</th>
                                <th className="text-left py-3 px-4 text-slate-400">Current</th>
                                <th className="text-left py-3 px-4 text-slate-400">Initial</th>
                                <th className="text-left py-3 px-4 text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-slate-400">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {flocks.map((flock) => (
                                <tr key={flock.id} className="border-b border-slate-700/50">
                                  <td className="py-3 px-4 text-white font-medium">{flock.batchNumber}</td>
                                  <td className="py-3 px-4 text-slate-300">{flock.breed}</td>
                                  <td className="py-3 px-4 text-slate-300">{flock.currentCount}</td>
                                  <td className="py-3 px-4 text-slate-300">{flock.initialCount}</td>
                                  <td className="py-3 px-4">
                                    <Badge className="bg-emerald-600">{flock.status}</Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {activeTab === "feed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border-amber-500/30">
                    <CardHeader>
                      <CardDescription className="text-amber-400">Starter Feed</CardDescription>
                      <CardTitle className="text-2xl text-white">850 kg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-amber-400 mt-2">85% stock level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-500/30">
                    <CardHeader>
                      <CardDescription className="text-green-400">Grower Feed</CardDescription>
                      <CardTitle className="text-2xl text-white">1,200 kg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={95} className="h-2" />
                      <p className="text-xs text-green-400 mt-2">95% stock level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-600/20 to-red-600/5 border-red-500/30">
                    <CardHeader>
                      <CardDescription className="text-red-400">Finisher Feed</CardDescription>
                      <CardTitle className="text-2xl text-white">450 kg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-red-400 mt-2">45% stock level - Reorder!</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Feed Inventory</CardTitle>
                      <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Feed
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center py-8">
                      Feed inventory management will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "health" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Tabs defaultValue="vaccinations">
                  <TabsList className="bg-slate-800 border-slate-700">
                    <TabsTrigger value="vaccinations" className="data-[state=active]:bg-emerald-600">Vaccinations</TabsTrigger>
                    <TabsTrigger value="medicines" className="data-[state=active]:bg-emerald-600">Medicine Inventory</TabsTrigger>
                    <TabsTrigger value="mortality" className="data-[state=active]:bg-emerald-600">Mortality Records</TabsTrigger>
                  </TabsList>

                  <TabsContent value="vaccinations" className="space-y-4 mt-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">Vaccination Schedule</CardTitle>
                          <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Vaccination
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">Newcastle Disease</p>
                                <p className="text-sm text-slate-400">Flock: B-2024-001</p>
                              </div>
                              <Badge className="bg-emerald-600">Completed</Badge>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-700/50 border border-orange-500/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">Infectious Bronchitis</p>
                                <p className="text-sm text-slate-400">Flock: B-2024-002</p>
                              </div>
                              <Badge className="bg-orange-600">Due in 3 days</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="medicines" className="mt-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="py-12 text-center">
                        <HeartPulse className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">Medicine Inventory</h3>
                        <p className="text-slate-400 mt-1">Manage your medicine and vaccine stock</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="mortality" className="mt-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="py-12 text-center">
                        <TrendingDown className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">Mortality Records</h3>
                        <p className="text-slate-400 mt-1">Track and analyze mortality data</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {activeTab === "financial" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border-emerald-500/30">
                    <CardHeader>
                      <CardDescription className="text-emerald-400">Total Revenue</CardDescription>
                      <CardTitle className="text-2xl text-white">${stats?.monthlyRevenue.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+12% from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-600/20 to-red-600/5 border-red-500/30">
                    <CardHeader>
                      <CardDescription className="text-red-400">Total Expenses</CardDescription>
                      <CardTitle className="text-2xl text-white">${stats?.monthlyExpenses.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-red-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">-5% from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 border-cyan-500/30">
                    <CardHeader>
                      <CardDescription className="text-cyan-400">Net Profit</CardDescription>
                      <CardTitle className="text-2xl text-white">${stats?.profit.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{((stats?.profit || 0) / (stats?.monthlyRevenue || 1) * 100).toFixed(1)}% margin</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Recent Transactions</CardTitle>
                      <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Transaction
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center py-8">
                      Transaction history will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "environment" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 border-orange-500/30">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-orange-400">Temperature</CardDescription>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <Thermometer className="w-5 h-5" />
                        28.5°C
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-400">Optimal: 24-28°C</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-500/30">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-400">Humidity</CardDescription>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        65%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-400">Optimal: 60-70%</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-purple-400">CO2 Level</CardDescription>
                      <CardTitle className="text-2xl text-white">450 ppm</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-400">Safe: &lt;1000 ppm</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 border-yellow-500/30">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-yellow-400">Ammonia</CardDescription>
                      <CardTitle className="text-2xl text-white">12 ppm</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-400">Safe: &lt;25 ppm</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Environment Monitoring</CardTitle>
                    <CardDescription className="text-slate-400">Real-time environmental data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={charts?.environmentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} name="Temperature (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">Reports & Analytics</h3>
                    <p className="text-slate-400 mt-1">Generate detailed reports and insights</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Farm Settings</CardTitle>
                    <CardDescription className="text-slate-400">Manage your farm profile and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-300">Farm Name</Label>
                        <Input defaultValue="TechChix Poultry Farm" className="bg-slate-700 border-slate-600 text-white mt-1" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Location</Label>
                        <Input defaultValue="Nairobi, Kenya" className="bg-slate-700 border-slate-600 text-white mt-1" />
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>
      <Toaster />
    </div>
  )
}
