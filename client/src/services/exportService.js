import jsPDF from "jspdf"
import html2canvas from "html2canvas"

class ExportService {
  // CSV Export Functions
  exportToCSV(data, filename = "kenny-meals-data") {
    if (!data || data.length === 0) {
      console.warn("No data to export")
      return
    }

    const csvContent = this.convertToCSV(data)
    this.downloadFile(csvContent, `${filename}.csv`, "text/csv")
  }

  convertToCSV(data) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    const headers = Object.keys(data[0])
    const csvRows = []

    // Add headers
    csvRows.push(headers.join(","))

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        // Handle nested objects and arrays
        if (typeof value === "object" && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        // Escape commas and quotes in strings
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      csvRows.push(values.join(","))
    }

    return csvRows.join("\n")
  }

  // PDF Export Functions
  async exportToPDF(elementId, filename = "kenny-meals-report") {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error("Element not found for PDF export")
        return
      }

      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error("PDF export failed:", error)
    }
  }

  // Comprehensive Dashboard Export
  async exportDashboardData(squareData, instagramData, dateRange) {
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `kenny-meals-dashboard-${dateRange}-${timestamp}`

    // Prepare comprehensive data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: dateRange,
        restaurant: "Kenny's Meals",
      },
      kpis: {
        revenue: squareData?.revenue || {},
        orders: squareData?.orders || {},
        averageOrderValue: squareData?.averageOrderValue || {},
        newCustomers: squareData?.newCustomers || {},
        returningCustomerRate: squareData?.returningCustomerRate || {},
        instagramFollowers: instagramData?.insights?.followerChange || {},
        engagementRate: instagramData?.insights?.engagement || {},
      },
      dailyData: squareData?.dailyData || [],
      topMenuItems: squareData?.topItems || [],
      recentTransactions: squareData?.recentTransactions || [],
      instagramInsights: {
        profile: instagramData?.profile || {},
        topPosts: instagramData?.insights?.topPosts || [],
        audienceInsights: instagramData?.insights?.audienceInsights || {},
        hashtagPerformance: instagramData?.insights?.hashtagPerformance || [],
      },
    }

    // Export as CSV
    this.exportToCSV(exportData.dailyData, `${filename}-daily-data`)

    // Export KPIs as CSV
    const kpiData = Object.entries(exportData.kpis).map(([key, value]) => ({
      metric: key,
      value: value.total || value.value || "N/A",
      change: value.change || "N/A",
      trend: value.trend || "N/A",
    }))
    this.exportToCSV(kpiData, `${filename}-kpis`)

    // Export menu items as CSV
    this.exportToCSV(exportData.topMenuItems, `${filename}-menu-items`)

    return exportData
  }

  // Utility function to download files
  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Format data for specific exports
  formatRevenueData(dailyData) {
    return dailyData.map((item) => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders,
      customers: item.customers,
      averageOrderValue: (item.revenue / item.orders).toFixed(2),
    }))
  }

  formatInstagramData(instagramData) {
    return {
      profile: instagramData?.profile || {},
      metrics: {
        followers: instagramData?.profile?.followersCount || 0,
        following: instagramData?.profile?.followingCount || 0,
        posts: instagramData?.profile?.mediaCount || 0,
        engagementRate: instagramData?.insights?.engagement?.rate || 0,
        reach: instagramData?.insights?.reach?.value || 0,
        impressions: instagramData?.insights?.impressions?.value || 0,
      },
      topPosts:
        instagramData?.insights?.topPosts?.map((post) => ({
          caption: post.caption,
          likes: post.likes,
          comments: post.comments,
          engagement: post.engagement,
          reach: post.reach,
        })) || [],
    }
  }
}

export default new ExportService()
