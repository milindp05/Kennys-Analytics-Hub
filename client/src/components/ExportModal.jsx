"use client"

import { useState } from "react"
import { X, Download, FileText, BarChart3, Camera } from "lucide-react"
import exportService from "../services/exportService"

export default function ExportModal({ isOpen, onClose, squareData, instagramData, dateRange }) {
  const [exportType, setExportType] = useState("all")
  const [format, setFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const baseFilename = `kenny-meals-${dateRange}-${timestamp}`

      switch (exportType) {
        case "all":
          await exportService.exportDashboardData(squareData, instagramData, dateRange)
          break

        case "revenue":
          const revenueData = exportService.formatRevenueData(squareData?.dailyData || [])
          exportService.exportToCSV(revenueData, `${baseFilename}-revenue`)
          break

        case "menu":
          exportService.exportToCSV(squareData?.topItems || [], `${baseFilename}-menu-items`)
          break

        case "social":
          const socialData = exportService.formatInstagramData(instagramData)
          exportService.exportToCSV([socialData.metrics], `${baseFilename}-instagram-metrics`)
          exportService.exportToCSV(socialData.topPosts, `${baseFilename}-instagram-posts`)
          break

        case "pdf":
          await exportService.exportToPDF("dashboard-content", `${baseFilename}-dashboard`)
          break

        default:
          break
      }

      onClose()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">What to export:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === "all"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-3 text-primary-600"
                />
                <BarChart3 className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Complete Dashboard Data</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="revenue"
                  checked={exportType === "revenue"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-3 text-primary-600"
                />
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Revenue & Orders Data</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="menu"
                  checked={exportType === "menu"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-3 text-primary-600"
                />
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Menu Performance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="social"
                  checked={exportType === "social"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-3 text-primary-600"
                />
                <Camera className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Instagram Analytics</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="pdf"
                  checked={exportType === "pdf"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-3 text-primary-600"
                />
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Dashboard PDF Report</span>
              </label>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Date Range:</strong>{" "}
              {dateRange === "1d" ? "Last 24 hours" : `Last ${dateRange.replace("d", "")} days`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Export Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button onClick={handleExport} disabled={isExporting} className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  )
}
