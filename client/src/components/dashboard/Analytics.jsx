"use client"

import { useState } from "react"
import { useSquareData } from "../../hooks/useSquareData"
import { useInstagramData } from "../../hooks/useInstagramData"
import { BarChart3, LineChart, PieChart, Filter, Download, RefreshCw } from "lucide-react"
import DateRangePicker from "../DateRangePicker"
import StoreFilter from "../StoreFilter"
import ExportModal from "../ExportModal"
import RevenueLineChart from "../charts/RevenueLineChart"
import OrdersStackedBarChart from "../charts/OrdersStackedBarChart"
import MenuItemsHorizontalBarChart from "../charts/MenuItemsHorizontalBarChart"
import CustomerSegmentPieChart from "../charts/CustomerSegmentPieChart"
import SocialEngagementChart from "../charts/SocialEngagementChart"
import HourlyPerformanceChart from "../charts/HourlyPerformanceChart"

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedStore, setSelectedStore] = useState("all")
  const [showExportModal, setShowExportModal] = useState(false)
  const [chartFilters, setChartFilters] = useState({
    showRevenue: true,
    showOrders: true,
    showCustomers: true,
    showSocial: true,
  })

  const { data: squareData, loading: squareLoading, refetch: refetchSquare } = useSquareData(dateRange)
  const { data: instagramData, loading: igLoading, refetch: refetchInstagram } = useInstagramData(dateRange)

  const handleRefreshAll = () => {
    refetchSquare()
    refetchInstagram()
  }

  const handleExportData = () => {
    setShowExportModal(true)
  }

  if (squareLoading && !squareData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" id="dashboard-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Detailed analytics and performance insights with interactive charts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button onClick={handleExportData} className="btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button onClick={handleRefreshAll} disabled={squareLoading || igLoading} className="btn-outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${squareLoading || igLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <StoreFilter value={selectedStore} onChange={setSelectedStore} />
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <div className="flex items-center space-x-3">
              {Object.entries(chartFilters).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setChartFilters((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {key
                      .replace("show", "")
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Line Chart */}
        {chartFilters.showRevenue && (
          <div className="lg:col-span-2">
            <RevenueLineChart data={squareData?.dailyData || []} loading={squareLoading} dateRange={dateRange} />
          </div>
        )}

        {/* Orders and Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartFilters.showOrders && (
            <OrdersStackedBarChart data={squareData?.dailyData || []} loading={squareLoading} />
          )}

          <HourlyPerformanceChart data={squareData?.hourlyData || []} loading={squareLoading} />
        </div>

        {/* Menu Items and Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MenuItemsHorizontalBarChart data={squareData?.topItems || []} loading={squareLoading} />

          {chartFilters.showCustomers && <CustomerSegmentPieChart data={squareData} loading={squareLoading} />}
        </div>

        {/* Social Media Analytics */}
        {chartFilters.showSocial && (
          <SocialEngagementChart data={instagramData?.insights?.dailyMetrics || []} loading={igLoading} />
        )}
      </div>

      {/* Summary Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <LineChart className="h-6 w-6 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${squareData?.revenue?.total?.toLocaleString() || "0"}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-mint-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{squareData?.orders?.total?.toLocaleString() || "0"}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <PieChart className="h-6 w-6 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{instagramData?.insights?.followerChange?.value || 0}</p>
            <p className="text-sm text-gray-600">New Followers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {instagramData?.insights?.engagement?.rate?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-600">Engagement Rate</p>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        squareData={squareData}
        instagramData={instagramData}
        dateRange={dateRange}
      />
    </div>
  )
}
