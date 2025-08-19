"use client"

import { useState, useEffect, useCallback } from "react"
import squareApi from "../services/squareApi"

export function useSquareData(dateRange = "7d", refreshInterval = 30000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const analytics = await squareApi.getAnalytics(dateRange)
      setData(analytics)
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
        const response = await squareApi.getOrders(dateRange)
        setOrders(response.orders)
      } catch (err) {
        setError(err.message)
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
        const response = await squareApi.getCustomers(dateRange)
        setCustomers(response.customers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [dateRange])

  return { customers, loading, error }
}
