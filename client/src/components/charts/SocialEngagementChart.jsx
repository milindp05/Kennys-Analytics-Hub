"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Instagram } from "lucide-react"

export default function SocialEngagementChart({ data, loading }) {
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Instagram className="h-5 w-5 mr-2 text-pink-500" />
            Social Media Engagement
          </h3>
          <p className="text-sm text-gray-600">Instagram engagement metrics over time</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
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
              dataKey="likes"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ fill: "#ec4899", strokeWidth: 2, r: 3 }}
              name="Likes"
            />
            <Line
              type="monotone"
              dataKey="comments"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: "#14b8a6", strokeWidth: 2, r: 3 }}
              name="Comments"
            />
            <Line
              type="monotone"
              dataKey="followers"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ fill: "#7c3aed", strokeWidth: 2, r: 3 }}
              name="New Followers"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
