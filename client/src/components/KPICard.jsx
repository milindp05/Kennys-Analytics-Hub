"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "../lib/utils"

export default function KPICard({ title, value, change, trend, icon: Icon, color = "primary" }) {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    mint: "from-mint-500 to-mint-600",
    pink: "from-pink-500 to-pink-600",
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "h-12 w-12 rounded-lg bg-gradient-to-r flex items-center justify-center",
              colorClasses[color],
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div
          className={cn("flex items-center text-sm font-medium", trend === "up" ? "text-green-600" : "text-red-600")}
        >
          {trend === "up" ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          {change}
        </div>
        <span className="ml-2 text-sm text-gray-500">vs last period</span>
      </div>
    </div>
  )
}
