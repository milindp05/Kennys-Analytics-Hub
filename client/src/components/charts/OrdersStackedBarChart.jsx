"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ShoppingCart } from "lucide-react"

export default function OrdersStackedBarChart({ data, loading }) {
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

  // Transform data to include order types
  const chartData = data.map((item) => ({
    ...item,
    dineIn: Math.floor(item.orders * 0.4),
    takeout: Math.floor(item.orders * 0.35),
    delivery: Math.floor(item.orders * 0.25),
  }))

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-mint-500" />
            Orders by Type
          </h3>
          <p className="text-sm text-gray-600">Daily orders breakdown by service type</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Bar dataKey="dineIn" stackId="a" fill="#14b8a6" name="Dine In" />
            <Bar dataKey="takeout" stackId="a" fill="#06b6d4" name="Takeout" />
            <Bar dataKey="delivery" stackId="a" fill="#8b5cf6" name="Delivery" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
