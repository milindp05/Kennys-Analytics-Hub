"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"

export default function HourlyPerformanceChart({ data, loading }) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Group data by hour and aggregate
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = data.filter((item) => item.hour === hour)
    const totalRevenue = hourData.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = hourData.reduce((sum, item) => sum + item.orders, 0)

    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      revenue: Math.round(totalRevenue / Math.max(hourData.length, 1)),
      orders: Math.round(totalOrders / Math.max(hourData.length, 1)),
    }
  })

  const formatCurrency = (value) => `$${value.toLocaleString()}`

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-500" />
            Hourly Performance
          </h3>
          <p className="text-sm text-gray-600">Average revenue and orders by hour</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={(value, name) => [
                name === "revenue" ? formatCurrency(value) : value,
                name === "revenue" ? "Avg Revenue" : "Avg Orders",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
