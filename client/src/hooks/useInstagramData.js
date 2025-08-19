"use client"

import { useState, useEffect, useCallback } from "react"
import instagramApi from "../services/instagramApi"

export function useInstagramData(dateRange = "7d", refreshInterval = 60000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const insights = await instagramApi.getInsights(dateRange)
      setData(insights)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
      console.error("Failed to fetch Instagram data:", err)
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

export function useInstagramMedia(limit = 12) {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        const response = await instagramApi.getMedia(limit)
        setMedia(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [limit])

  return { media, loading, error }
}
