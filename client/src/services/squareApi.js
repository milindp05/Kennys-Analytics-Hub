class SquareAPIService {
  constructor() {
    this.baseURL = "https://connect.squareup.com/v2"
    this.accessToken = process.env.REACT_APP_SQUARE_ACCESS_TOKEN || "mock-token"
    this.applicationId = process.env.REACT_APP_SQUARE_APPLICATION_ID || "mock-app-id"
    this.locationId = process.env.REACT_APP_SQUARE_LOCATION_ID || "mock-location-id"
  }

  // Mock data generator for development
  generateMockData(dateRange = "7d") {
    const now = new Date()
    const days = Number.parseInt(dateRange.replace("d", ""))

    // Generate realistic mock data based on date range
    const baseRevenue = 12426
    const baseOrders = 1247
    const baseCustomers = 89

    const multiplier = days / 7 // Scale based on date range

    return {
      revenue: {
        total: Math.round(baseRevenue * multiplier),
        change: this.getRandomChange(),
        trend: "up",
        currency: "USD",
      },
      orders: {
        total: Math.round(baseOrders * multiplier),
        change: this.getRandomChange(),
        trend: "up",
      },
      averageOrderValue: {
        total: Math.round(((baseRevenue * multiplier) / (baseOrders * multiplier)) * 100) / 100,
        change: this.getRandomChange(),
        trend: "up",
        currency: "USD",
      },
      newCustomers: {
        total: Math.round(baseCustomers * multiplier),
        change: this.getRandomChange(),
        trend: "up",
      },
      returningCustomerRate: {
        total: Math.round(Math.random() * 30 + 45), // 45-75%
        change: this.getRandomChange(),
        trend: Math.random() > 0.5 ? "up" : "down",
      },
      topItems: [
        { name: "Signature Burger", orders: Math.round(127 * multiplier), revenue: Math.round(1524 * multiplier) },
        { name: "Chicken Wings", orders: Math.round(98 * multiplier), revenue: Math.round(1176 * multiplier) },
        { name: "Caesar Salad", orders: Math.round(76 * multiplier), revenue: Math.round(912 * multiplier) },
        { name: "Fish & Chips", orders: Math.round(64 * multiplier), revenue: Math.round(768 * multiplier) },
        { name: "Pasta Carbonara", orders: Math.round(52 * multiplier), revenue: Math.round(624 * multiplier) },
      ],
      recentTransactions: this.generateRecentTransactions(),
      hourlyData: this.generateHourlyData(days),
      dailyData: this.generateDailyData(days),
    }
  }

  getRandomChange() {
    const changes = ["+12.5%", "+8.2%", "+15.3%", "+3.1%", "+22.7%", "+5.8%", "-2.1%", "+18.9%"]
    return changes[Math.floor(Math.random() * changes.length)]
  }

  generateRecentTransactions() {
    const transactions = [
      { id: "txn_001", customer: "John D.", amount: 24.5, time: "2 min ago", status: "completed" },
      { id: "txn_002", customer: "Sarah M.", amount: 18.75, time: "5 min ago", status: "completed" },
      { id: "txn_003", customer: "Mike R.", amount: 32.25, time: "8 min ago", status: "completed" },
      { id: "txn_004", customer: "Lisa K.", amount: 15.5, time: "12 min ago", status: "completed" },
      { id: "txn_005", customer: "David L.", amount: 28.0, time: "15 min ago", status: "completed" },
    ]
    return transactions
  }

  generateHourlyData(days) {
    const hours = Math.min(days * 24, 168) // Max 7 days of hourly data
    return Array.from({ length: hours }, (_, i) => ({
      hour: new Date(Date.now() - (hours - i) * 60 * 60 * 1000).getHours(),
      revenue: Math.round(Math.random() * 500 + 100),
      orders: Math.round(Math.random() * 20 + 5),
    }))
  }

  generateDailyData(days) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split("T")[0],
        revenue: Math.round(Math.random() * 2000 + 800),
        orders: Math.round(Math.random() * 80 + 40),
        customers: Math.round(Math.random() * 30 + 15),
      }
    })
  }

  // Main API methods
  async getAnalytics(dateRange = "7d", storeId = null) {
    try {
      // In production, make actual API call:
      // const response = await fetch(`${this.baseURL}/locations/${this.locationId}/analytics`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // })

      // For now, return mock data
      await this.simulateNetworkDelay()
      return this.generateMockData(dateRange)
    } catch (error) {
      console.error("Square API Error:", error)
      throw new Error("Failed to fetch analytics data")
    }
  }

  async getOrders(dateRange = "7d", limit = 50) {
    try {
      await this.simulateNetworkDelay()

      // Mock orders data
      return {
        orders: Array.from({ length: limit }, (_, i) => ({
          id: `order_${Date.now()}_${i}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalMoney: {
            amount: Math.round(Math.random() * 5000 + 500), // cents
            currency: "USD",
          },
          state: "COMPLETED",
          locationId: this.locationId,
          source: { name: "Square Point of Sale" },
        })),
      }
    } catch (error) {
      console.error("Square Orders API Error:", error)
      throw new Error("Failed to fetch orders data")
    }
  }

  async getCustomers(dateRange = "7d") {
    try {
      await this.simulateNetworkDelay()

      return {
        customers: Array.from({ length: 50 }, (_, i) => ({
          id: `customer_${i}`,
          givenName: ["John", "Sarah", "Mike", "Lisa", "David", "Emma", "Chris", "Anna"][Math.floor(Math.random() * 8)],
          familyName: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Miller", "Taylor", "Anderson"][
            Math.floor(Math.random() * 8)
          ],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          preferences: {
            emailUnsubscribed: Math.random() > 0.8,
          },
        })),
      }
    } catch (error) {
      console.error("Square Customers API Error:", error)
      throw new Error("Failed to fetch customers data")
    }
  }

  async simulateNetworkDelay() {
    // Simulate realistic API response time
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 200))
  }

  // Utility methods
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  formatPercentage(value) {
    return `${value > 0 ? "+" : ""}${value}%`
  }
}

export default new SquareAPIService()
