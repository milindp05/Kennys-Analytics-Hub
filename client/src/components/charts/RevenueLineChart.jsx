"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

export default function RevenueLineChart({ data, loading, dateRange }) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value) => `$${value.toLocaleString()}`
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
            Revenue Trend
          </h3>
          <p className="text-sm text-gray-600">Daily revenue performance over time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ${data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Revenue"]}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#7c3aed", strokeWidth: 2 }}
              name="Daily Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
