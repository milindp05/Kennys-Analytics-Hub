import express from "express"
import axios from "axios"

const router = express.Router()

// Square API configuration
const SQUARE_BASE_URL = process.env.SQUARE_ENVIRONMENT === "production" 
  ? "https://connect.squareup.com" 
  : "https://connect.squareupsandbox.com"

const squareHeaders = {
  "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
  "Square-Version": "2023-10-18",
}

// Helper function to get location ID
async function getLocationId() {
  if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here') {
    return null
  }

  try {
    const response = await axios.get(
      `${SQUARE_BASE_URL}/v2/locations`,
      { headers: squareHeaders }
    )
    
    const locations = response.data.locations || []
    // Return the first active location
    const activeLocation = locations.find(location => location.status === 'ACTIVE')
    return activeLocation ? activeLocation.id : (locations[0]?.id || null)
  } catch (error) {
    console.error("Error fetching locations:", error.response?.data || error.message)
    return null
  }
}

// Get locations
router.get("/locations", async (req, res) => {
  try {
    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here') {
      return res.json({
        success: true,
        data: [],
        message: "Square API token not configured",
      })
    }

    const response = await axios.get(
      `${SQUARE_BASE_URL}/v2/locations`,
      { headers: squareHeaders }
    )

    const locations = response.data.locations || []
    
    res.json({
      success: true,
      data: locations.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        status: location.status,
        businessName: location.business_name,
        type: location.type,
      })),
    })
  } catch (error) {
    console.error("Square Locations Error:", error.response?.data || error.message)
    res.json({
      success: false,
      error: "Failed to fetch locations",
      message: error.response?.data?.errors?.[0]?.detail || error.message,
    })
  }
})

// Get dashboard KPIs
router.get("/kpis", async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    let locationId = req.query.locationId

    // If no location ID provided, get it dynamically
    if (!locationId) {
      locationId = await getLocationId()
    }

    // Default to last 30 days if no dates provided
    const endDateTime = endDate ? new Date(endDate) : new Date()
    const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Format dates for Square API (RFC 3339 format)
    const beginTime = startDateTime.toISOString()
    const endTime = endDateTime.toISOString()

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here' || !locationId) {
      // Return mock data if no valid token or location
      const mockKPIs = {
        revenue: { current: 0, previous: 0, change: 0 },
        orders: { current: 0, previous: 0, change: 0 },
        averageOrderValue: { current: 0, previous: 0, change: 0 },
        customers: { current: 0, previous: 0, change: 0 },
      }

      return res.json({
        success: true,
        data: mockKPIs,
        message: !locationId ? "No Square location found" : "Using mock data - Square API token not configured",
        period: { startDate: beginTime, endDate: endTime },
      })
    }

    // Search for orders in the specified time range
    const searchRequest = {
      location_ids: [locationId],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: beginTime,
              end_at: endTime,
            },
          },
          state_filter: {
            states: ["COMPLETED"],
          },
        },
      },
    }

    const ordersResponse = await axios.post(
      `${SQUARE_BASE_URL}/v2/orders/search`,
      searchRequest,
      { headers: squareHeaders }
    )

    const orders = ordersResponse.data.orders || []

    // Calculate KPIs from real order data
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.total_money?.amount || 0)
    }, 0) / 100 // Convert from cents to dollars

    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get unique customers
    const uniqueCustomers = new Set(
      orders
        .filter(order => order.customer_id)
        .map(order => order.customer_id)
    ).size

    // For comparison, get previous period data
    const periodDuration = endDateTime - startDateTime
    const prevEndTime = new Date(startDateTime.getTime()).toISOString()
    const prevStartTime = new Date(startDateTime.getTime() - periodDuration).toISOString()

    const prevSearchRequest = {
      ...searchRequest,
      query: {
        ...searchRequest.query,
        filter: {
          ...searchRequest.query.filter,
          date_time_filter: {
            created_at: {
              start_at: prevStartTime,
              end_at: prevEndTime,
            },
          },
        },
      },
    }

    const prevOrdersResponse = await axios.post(
      `${SQUARE_BASE_URL}/v2/orders/search`,
      prevSearchRequest,
      { headers: squareHeaders }
    )

    const prevOrders = prevOrdersResponse.data.orders || []

    const prevRevenue = prevOrders.reduce((sum, order) => {
      return sum + (order.total_money?.amount || 0)
    }, 0) / 100

    const prevOrderCount = prevOrders.length
    const prevAverageOrderValue = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const ordersChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0
    const aovChange = prevAverageOrderValue > 0 ? ((averageOrderValue - prevAverageOrderValue) / prevAverageOrderValue) * 100 : 0

    const kpis = {
      revenue: {
        current: Math.round(totalRevenue * 100) / 100,
        previous: Math.round(prevRevenue * 100) / 100,
        change: Math.round(revenueChange * 10) / 10,
      },
      orders: {
        current: totalOrders,
        previous: prevOrderCount,
        change: Math.round(ordersChange * 10) / 10,
      },
      averageOrderValue: {
        current: Math.round(averageOrderValue * 100) / 100,
        previous: Math.round(prevAverageOrderValue * 100) / 100,
        change: Math.round(aovChange * 10) / 10,
      },
      customers: {
        current: uniqueCustomers,
        previous: 0, // Would need more complex logic to track previous period customers
        change: 0,
      },
    }

    res.json({
      success: true,
      data: kpis,
      period: { startDate: beginTime, endDate: endTime },
      locationId,
      ordersProcessed: totalOrders,
    })
  } catch (error) {
    console.error("Square KPIs Error:", error.response?.data || error.message)
    
    // Return mock data as fallback if API fails
    const mockKPIs = {
      revenue: { current: 0, previous: 0, change: 0 },
      orders: { current: 0, previous: 0, change: 0 },
      averageOrderValue: { current: 0, previous: 0, change: 0 },
      customers: { current: 0, previous: 0, change: 0 },
    }

    res.json({
      success: true,
      data: mockKPIs,
      error: "Using fallback data - check Square API configuration",
      message: error.response?.data?.errors?.[0]?.detail || error.message,
    })
  }
})

// Get orders data
router.get("/orders", async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query
    let locationId = req.query.locationId

    // If no location ID provided, get it dynamically
    if (!locationId) {
      locationId = await getLocationId()
    }

    // Default to last 7 days if no dates provided
    const endDateTime = endDate ? new Date(endDate) : new Date()
    const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Format dates for Square API
    const beginTime = startDateTime.toISOString()
    const endTime = endDateTime.toISOString()

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here' || !locationId) {
      // Return mock data if no valid token or location
      const mockOrders = []
      return res.json({
        success: true,
        data: mockOrders,
        message: !locationId ? "No Square location found" : "Using mock data - Square API token not configured",
        period: { startDate: beginTime, endDate: endTime },
      })
    }

    const searchRequest = {
      location_ids: [locationId],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: beginTime,
              end_at: endTime,
            },
          },
          state_filter: {
            states: ["COMPLETED", "OPEN"],
          },
        },
        sort: {
          sort_field: "CREATED_AT",
          sort_order: "DESC",
        },
      },
      limit: parseInt(limit),
    }

    const ordersResponse = await axios.post(
      `${SQUARE_BASE_URL}/v2/orders/search`,
      searchRequest,
      { headers: squareHeaders }
    )

    const orders = ordersResponse.data.orders || []

    // Transform Square orders to our dashboard format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      amount: (order.total_money?.amount || 0) / 100, // Convert from cents
      status: order.state?.toLowerCase() || 'pending',
      customer: order.customer_id || 'Guest',
      timestamp: order.created_at,
      items: order.line_items?.map(item => ({
        name: item.name || 'Unknown Item',
        quantity: parseInt(item.quantity) || 1,
        price: (item.total_money?.amount || 0) / 100,
      })) || [],
      location: order.location_id,
    }))

    res.json({
      success: true,
      data: transformedOrders,
      period: { startDate: beginTime, endDate: endTime },
      locationId,
      totalOrders: transformedOrders.length,
    })
  } catch (error) {
    console.error("Square Orders Error:", error.response?.data || error.message)
    
    // Return empty array as fallback
    res.json({
      success: true,
      data: [],
      error: "Using fallback data - check Square API configuration",
      message: error.response?.data?.errors?.[0]?.detail || error.message,
    })
  }
})

// Get menu items performance
router.get("/menu-items", async (req, res) => {
  try {
    const mockMenuItems = [
      { name: "Kenny's Special Burger", sales: 245, revenue: 6125.0 },
      { name: "Grilled Chicken Salad", sales: 189, revenue: 3402.0 },
      { name: "Fish & Chips", sales: 156, revenue: 3744.0 },
      { name: "Veggie Wrap", sales: 134, revenue: 2144.0 },
      { name: "BBQ Ribs", sales: 98, revenue: 2940.0 },
    ]

    res.json({
      success: true,
      data: mockMenuItems,
    })
  } catch (error) {
    console.error("Square Menu Items Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch menu items",
      message: error.message,
    })
  }
})

// Get revenue analytics
router.get("/analytics/revenue", async (req, res) => {
  try {
    const { period = "7d" } = req.query

    // Generate mock revenue data based on period
    const mockRevenueData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      revenue: Math.floor(Math.random() * 2000) + 1000,
      orders: Math.floor(Math.random() * 50) + 20,
    }))

    res.json({
      success: true,
      data: mockRevenueData,
      period,
    })
  } catch (error) {
    console.error("Square Revenue Analytics Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch revenue analytics",
      message: error.message,
    })
  }
})

export default router
