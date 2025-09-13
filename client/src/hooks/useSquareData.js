"use client"

import { useState, useEffect, useCallback } from "react"

// Helper functions for date calculation
function getStartDate(dateRange) {
  const now = new Date()
  const days = parseInt(dateRange.replace('d', ''))
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
  return startDate.toISOString()
}

function getEndDate() {
  return new Date().toISOString()
}

// Helper functions for mock data generation
function generateHourlyData(dateRange) {
  const days = parseInt(dateRange.replace('d', ''))
  const hours = Math.min(days * 24, 168) // Max 7 days of hourly data
  return Array.from({ length: hours }, (_, i) => ({
    hour: new Date(Date.now() - (hours - i) * 60 * 60 * 1000).getHours(),
    revenue: Math.round(Math.random() * 500 + 100),
    orders: Math.round(Math.random() * 20 + 5),
  }))
}

function generateDailyData(dateRange) {
  const days = parseInt(dateRange.replace('d', ''))
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

export function useSquareData(dateRange = "7d", refreshInterval = 30000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Call backend API instead of mock service
      const response = await fetch(`http://localhost:5000/api/square/kpis?startDate=${getStartDate(dateRange)}&endDate=${getEndDate()}`)
      const result = await response.json()
      
      if (result.success) {
        // Transform backend data to match expected format
        const analytics = {
          revenue: {
            total: result.data.revenue.current,
            change: `${result.data.revenue.change > 0 ? '+' : ''}${result.data.revenue.change}%`,
            trend: result.data.revenue.change > 0 ? "up" : "down",
            currency: "USD",
          },
          orders: {
            total: result.data.orders.current,
            change: `${result.data.orders.change > 0 ? '+' : ''}${result.data.orders.change}%`,
            trend: result.data.orders.change > 0 ? "up" : "down",
          },
          averageOrderValue: {
            total: result.data.averageOrderValue.current,
            change: `${result.data.averageOrderValue.change > 0 ? '+' : ''}${result.data.averageOrderValue.change}%`,
            trend: result.data.averageOrderValue.change > 0 ? "up" : "down",
            currency: "USD",
          },
          newCustomers: {
            total: result.data.customers.current,
            change: `${result.data.customers.change > 0 ? '+' : ''}${result.data.customers.change}%`,
            trend: result.data.customers.change > 0 ? "up" : "down",
          },
          // Use calculated data from backend
          returningCustomerRate: {
            total: result.data.returningCustomerRate?.current || 0,
            change: `${result.data.returningCustomerRate?.change > 0 ? '+' : ''}${result.data.returningCustomerRate?.change || 0}%`,
            trend: result.data.returningCustomerRate?.change > 0 ? "up" : "down",
          },
          topItems: [
            { name: "Signature Burger", orders: 127, revenue: 1524 },
            { name: "Chicken Wings", orders: 98, revenue: 1176 },
            { name: "Caesar Salad", orders: 76, revenue: 912 },
            { name: "Fish & Chips", orders: 64, revenue: 768 },
            { name: "Pasta Carbonara", orders: 52, revenue: 624 },
          ],
          recentTransactions: [
            { id: "txn_001", customer: "John D.", amount: 24.5, time: "2 min ago", status: "completed" },
            { id: "txn_002", customer: "Sarah M.", amount: 18.75, time: "5 min ago", status: "completed" },
            { id: "txn_003", customer: "Mike R.", amount: 32.25, time: "8 min ago", status: "completed" },
            { id: "txn_004", customer: "Lisa K.", amount: 15.5, time: "12 min ago", status: "completed" },
            { id: "txn_005", customer: "David L.", amount: 28.0, time: "15 min ago", status: "completed" },
          ],
          hourlyData: generateHourlyData(dateRange),
          dailyData: generateDailyData(dateRange),
        }
        setData(analytics)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
      console.error("Failed to fetch Square data:", err)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  }
}

export function useSquareOrders(dateRange = "7d") {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5000/api/square/orders?startDate=${getStartDate(dateRange)}&endDate=${getEndDate()}&limit=50`)
        const result = await response.json()
        
        if (result.success) {
          setOrders(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch orders')
        }
      } catch (err) {
        setError(err.message)
        console.error("Failed to fetch Square orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [dateRange])

  return { orders, loading, error }
}

export function useSquareCustomers(dateRange = "7d") {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        // For now, return mock customers since backend doesn't have customers endpoint
        const mockCustomers = Array.from({ length: 50 }, (_, i) => ({
          id: `customer_${i}`,
          givenName: ["John", "Sarah", "Mike", "Lisa", "David", "Emma", "Chris", "Anna"][Math.floor(Math.random() * 8)],
          familyName: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Miller", "Taylor", "Anderson"][
            Math.floor(Math.random() * 8)
          ],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          preferences: {
            emailUnsubscribed: Math.random() > 0.8,
          },
        }))
        setCustomers(mockCustomers)
      } catch (err) {
        setError(err.message)
        console.error("Failed to fetch Square customers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [dateRange])

  return { customers, loading, error }
}
