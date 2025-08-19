"use client"

import { useState } from "react"
import { DollarSign, ShoppingCart, Users, TrendingUp, RefreshCw, AlertCircle, Instagram } from "lucide-react"
import { useSquareData } from "../../hooks/useSquareData"
import { useInstagramData } from "../../hooks/useInstagramData"
import KPICard from "../KPICard"
import DateRangePicker from "../DateRangePicker"
import RecentActivity from "../RecentActivity"
import TopMenuItems from "../TopMenuItems"
import AIChat from "../AIChat"

export default function Overview() {
  const [dateRange, setDateRange] = useState("7d")
  const {
    data: squareData,
    loading: squareLoading,
    error: squareError,
    lastUpdated,
    refetch,
  } = useSquareData(dateRange)
  const { data: instagramData, loading: igLoading } = useInstagramData(dateRange)

  if (squareLoading && !squareData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (squareError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600">Failed to load dashboard data</p>
            <p className="text-sm text-gray-500">{squareError}</p>
            <button onClick={refetch} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${squareData?.revenue?.total?.toLocaleString() || "0"}`,
      change: squareData?.revenue?.change || "+0%",
      trend: squareData?.revenue?.trend || "up",
      icon: DollarSign,
      color: "primary",
    },
    {
      title: "Total Orders",
      value: squareData?.orders?.total?.toLocaleString() || "0",
      change: squareData?.orders?.change || "+0%",
      trend: squareData?.orders?.trend || "up",
      icon: ShoppingCart,
      color: "mint",
    },
    {
      title: "Average Order Value",
      value: `$${squareData?.averageOrderValue?.total || "0.00"}`,
      change: squareData?.averageOrderValue?.change || "+0%",
      trend: squareData?.averageOrderValue?.trend || "up",
      icon: TrendingUp,
      color: "pink",
    },
    {
      title: "New Customers",
      value: squareData?.newCustomers?.total?.toString() || "0",
      change: squareData?.newCustomers?.change || "+0%",
      trend: squareData?.newCustomers?.trend || "up",
      icon: Users,
      color: "primary",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your restaurant's performance and key metrics
            {lastUpdated && (
              <span className="ml-2 text-gray-400">• Last updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button onClick={refetch} disabled={squareLoading} className="btn-outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${squareLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Additional KPI Row with Instagram */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returning Customer Rate</p>
              <p className="text-2xl font-bold text-gray-900">{squareData?.returningCustomerRate?.total || 0}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-mint-500 to-mint-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div
              className={`flex items-center text-sm font-medium ${
                squareData?.returningCustomerRate?.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {squareData?.returningCustomerRate?.change || "+0%"}
            </div>
            <span className="ml-2 text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">IG Follower Change</p>
              <p className="text-2xl font-bold text-gray-900">+{instagramData?.insights?.followerChange?.value || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div
              className={`flex items-center text-sm font-medium ${
                instagramData?.insights?.followerChange?.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {instagramData?.insights?.followerChange?.change || "+0%"}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {instagramData?.insights?.followerChange?.period || "last 7 days"}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Hour Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.max(...(squareData?.hourlyData?.map((h) => h.revenue) || [0])).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Best performing hour today</p>
          </div>
        </div>
      </div>

      {/* Activity and Menu Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity transactions={squareData?.recentTransactions || []} />
        <TopMenuItems items={squareData?.topItems || []} />
      </div>

      {/* AI Chat Component */}
      <AIChat squareData={squareData} instagramData={instagramData} />
    </div>
  )
}
