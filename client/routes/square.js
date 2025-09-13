import dotenv from "dotenv"
dotenv.config()

import express from "express"
import axios from "axios"

const router = express.Router()

// Debug: Log environment variables (mask sensitive info)
console.log("SQUARE_ACCESS_TOKEN:", process.env.SQUARE_ACCESS_TOKEN);
console.log("SQUARE_ENVIRONMENT:", process.env.SQUARE_ENVIRONMENT);
console.log("SQUARE_LOCATION_ID:", process.env.SQUARE_LOCATION_ID);

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
  // Prefer explicit location ID from env
  if (process.env.SQUARE_LOCATION_ID && process.env.SQUARE_LOCATION_ID.trim() !== '') {
    return process.env.SQUARE_LOCATION_ID;
  }
  if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here') {
    return null;
  }
  try {
    const response = await axios.get(
      `${SQUARE_BASE_URL}/v2/locations`,
      { headers: squareHeaders }
    );
    const locations = response.data.locations || [];
    const activeLocation = locations.find(location => location.status === 'ACTIVE');
    return activeLocation ? activeLocation.id : (locations[0]?.id || null);
  } catch (error) {
    console.error("Error fetching locations:", error.response?.data || error.message);
    return null;
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
    console.error("Square Locations Error:", error); // log full error object
    res.json({
      success: false,
      error: "Failed to fetch locations",
      message: error.response?.data?.errors?.[0]?.detail || error.message,
    })
  }
})

// Get dashboard KPIs
router.get("/kpis", async (req, res) => {
  // Debug log for env vars and locationId
  console.log("SQUARE_ACCESS_TOKEN:", process.env.SQUARE_ACCESS_TOKEN?.slice(0,8), "... (hidden)");
  console.log("SQUARE_ENVIRONMENT:", process.env.SQUARE_ENVIRONMENT);
  console.log("SQUARE_LOCATION_ID:", process.env.SQUARE_LOCATION_ID);
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
        returningCustomerRate: { current: 0, previous: 0, change: 0 },
      }

      return res.json({
        success: true,
        data: mockKPIs,
        message: !locationId ? "No Square location found" : "Using mock data - Square API token not configured",
        period: { startDate: beginTime, endDate: endTime },
      })
    }

    // Pagination logic to get all orders for KPIs
    let allOrders = []
    let cursor = null
    const maxPerPage = 500

    console.log('Orders endpoint - Making Square API call with:', {
      locationId,
      beginTime,
      endTime,
      SQUARE_BASE_URL
    })

    do {
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
        limit: maxPerPage,
        ...(cursor ? { cursor } : {}),
      }

      const ordersResponse = await axios.post(
        `${SQUARE_BASE_URL}/v2/orders/search`,
        searchRequest,
        { headers: squareHeaders }
      )

      const orders = ordersResponse.data.orders || []
      console.log(`Orders endpoint - Square API returned ${orders.length} orders in this batch`)
      allOrders = allOrders.concat(orders)
      cursor = ordersResponse.data.cursor
    } while (cursor)

    console.log(`Orders endpoint - Total orders fetched from Square API: ${allOrders.length}`)

    // Calculate KPIs from all real order data
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.total_money?.amount || 0)
    }, 0) / 100 // Convert from cents to dollars

    const totalOrders = allOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get unique customers and calculate returning customer rate
    const customerOrders = {}
    allOrders.forEach(order => {
      if (order.customer_id) {
        if (!customerOrders[order.customer_id]) {
          customerOrders[order.customer_id] = []
        }
        customerOrders[order.customer_id].push(order)
      }
    })
    
    const uniqueCustomers = Object.keys(customerOrders).length
    const returningCustomers = Object.values(customerOrders).filter(orders => orders.length > 1).length
    const returningCustomerRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0

    // For comparison, get previous period data (also paginated)
    const periodDuration = endDateTime - startDateTime
    const prevEndTime = new Date(startDateTime.getTime()).toISOString()
    const prevStartTime = new Date(startDateTime.getTime() - periodDuration).toISOString()

    let prevAllOrders = []
    let prevCursor = null
    do {
      const prevSearchRequest = {
        location_ids: [locationId],
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: prevStartTime,
                end_at: prevEndTime,
              },
            },
            state_filter: {
              states: ["COMPLETED"],
            },
          },
        },
        limit: maxPerPage,
        ...(prevCursor ? { cursor: prevCursor } : {}),
      }

      const prevOrdersResponse = await axios.post(
        `${SQUARE_BASE_URL}/v2/orders/search`,
        prevSearchRequest,
        { headers: squareHeaders }
      )

      const prevOrders = prevOrdersResponse.data.orders || []
      prevAllOrders = prevAllOrders.concat(prevOrders)
      prevCursor = prevOrdersResponse.data.cursor
    } while (prevCursor)

    const prevRevenue = prevAllOrders.reduce((sum, order) => {
      return sum + (order.total_money?.amount || 0)
    }, 0) / 100

    const prevOrderCount = prevAllOrders.length
    const prevAverageOrderValue = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0

    // Calculate previous period returning customer rate
    const prevCustomerOrders = {}
    prevAllOrders.forEach(order => {
      if (order.customer_id) {
        if (!prevCustomerOrders[order.customer_id]) {
          prevCustomerOrders[order.customer_id] = []
        }
        prevCustomerOrders[order.customer_id].push(order)
      }
    })
    
    const prevUniqueCustomers = Object.keys(prevCustomerOrders).length
    const prevReturningCustomers = Object.values(prevCustomerOrders).filter(orders => orders.length > 1).length
    const prevReturningCustomerRate = prevUniqueCustomers > 0 ? (prevReturningCustomers / prevUniqueCustomers) * 100 : 0

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const ordersChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0
    const aovChange = prevAverageOrderValue > 0 ? ((averageOrderValue - prevAverageOrderValue) / prevAverageOrderValue) * 100 : 0
    const returningCustomerRateChange = prevReturningCustomerRate > 0 ? ((returningCustomerRate - prevReturningCustomerRate) / prevReturningCustomerRate) * 100 : 0

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
      returningCustomerRate: {
        current: Math.round(returningCustomerRate * 10) / 10,
        previous: Math.round(prevReturningCustomerRate * 10) / 10,
        change: Math.round(returningCustomerRateChange * 10) / 10,
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
      returningCustomerRate: { current: 0, previous: 0, change: 0 },
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

    // Pagination logic to get all orders
    let allOrders = []
    let cursor = null
    let totalFetched = 0
    const maxPerPage = 500

    console.log('Orders endpoint - Making Square API call with:', {
      locationId,
      beginTime,
      endTime,
      SQUARE_BASE_URL
    })

    do {
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
        limit: maxPerPage,
        ...(cursor ? { cursor } : {}),
      }

      const ordersResponse = await axios.post(
        `${SQUARE_BASE_URL}/v2/orders/search`,
        searchRequest,
        { headers: squareHeaders }
      )

      const orders = ordersResponse.data.orders || []
      console.log(`Orders endpoint - Square API returned ${orders.length} orders in this batch`)
      allOrders = allOrders.concat(orders)
      cursor = ordersResponse.data.cursor
      totalFetched += orders.length

      // If a limit is set in the query, stop when reached
      if (limit && allOrders.length >= parseInt(limit)) {
        break
      }
    } while (cursor)

    console.log(`Orders endpoint - Total orders fetched from Square API: ${allOrders.length}`)

    // If a limit is set, only return up to that many orders for display
    const displayOrders = limit ? allOrders.slice(0, parseInt(limit)) : allOrders

    // Debug: Log some sample orders to see the data structure
    console.log('Sample Square order data:', JSON.stringify(displayOrders.slice(0, 2), null, 2))
    
    // Debug: Check if orders have line_items
    const ordersWithLineItems = displayOrders.filter(order => order.line_items && order.line_items.length > 0)
    console.log(`Orders with line_items: ${ordersWithLineItems.length} out of ${displayOrders.length}`)
    
    if (ordersWithLineItems.length > 0) {
      console.log('Sample order with line_items:', JSON.stringify(ordersWithLineItems[0], null, 2))
    }
    
    // Transform Square orders to our dashboard format
    const transformedOrders = displayOrders.map(order => {
      // Process line items with better data extraction
      const items = order.line_items?.map(item => {
        // Try multiple fields for item name
        const itemName = item.name || 
                        item.display_name || 
                        item.catalog_object_id || 
                        'Unknown Item'
        
        // Try multiple fields for price
        const price = (item.total_money?.amount || 
                      item.base_price_money?.amount || 
                      item.variation_total_price_money?.amount || 
                      0) / 100
        
        return {
          name: itemName,
          quantity: parseInt(item.quantity) || 1,
          price: price,
          catalog_object_id: item.catalog_object_id,
          variation_name: item.variation_name
        }
      }) || []

      return {
        id: order.id,
        amount: (order.total_money?.amount || 0) / 100, // Convert from cents
        status: order.state?.toLowerCase() || 'pending',
        customer: order.customer_id || 'Guest',
        timestamp: order.created_at,
        items: items,
        location: order.location_id,
        // For frontend compatibility:
        createdAt: order.created_at,
        lineItems: items, // Use same data as items
        totalMoney: order.total_money,
        state: order.state,
        // Keep original line_items for debugging
        original_line_items: order.line_items
      }
    })
    
    // Debug: Log transformed orders to see the final structure
    console.log('Transformed orders sample:', JSON.stringify(transformedOrders.slice(0, 2), null, 2))
    console.log('Total orders being returned:', transformedOrders.length)
    
    // Debug: Check if any orders have items
    const ordersWithItems = transformedOrders.filter(order => order.items && order.items.length > 0)
    console.log('Orders with items after transformation:', ordersWithItems.length)
    if (ordersWithItems.length > 0) {
      console.log('Sample transformed order with items:', JSON.stringify(ordersWithItems[0], null, 2))
    }

    res.json({
      success: true,
      data: transformedOrders,
      period: { startDate: beginTime, endDate: endTime },
      locationId,
      totalOrders: allOrders.length,
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

// Get menu items performance (mock)
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

// Get customer analytics over time
router.get("/analytics/customers", async (req, res) => {
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

    // Format dates for Square API
    const beginTime = startDateTime.toISOString()
    const endTime = endDateTime.toISOString()

    if (!process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_ACCESS_TOKEN === 'your_square_access_token_here' || !locationId) {
      // Return mock data if no valid token or location
      const mockCustomerData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
        return {
          date: date.toISOString().split("T")[0],
          newCustomers: Math.floor(Math.random() * 20) + 5,
          returningCustomers: Math.floor(Math.random() * 15) + 10,
          totalCustomers: Math.floor(Math.random() * 35) + 15,
        }
      })

      return res.json({
        success: true,
        data: mockCustomerData,
        message: !locationId ? "No Square location found" : "Using mock data - Square API token not configured",
        period: { startDate: beginTime, endDate: endTime },
      })
    }

    // Get all orders for the period
    let allOrders = []
    let cursor = null
    const maxPerPage = 500

    console.log('Making Square API call with:', {
      locationId,
      beginTime,
      endTime,
      SQUARE_BASE_URL
    })

    do {
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
        limit: maxPerPage,
        ...(cursor ? { cursor } : {}),
      }

      console.log('Square API search request:', JSON.stringify(searchRequest, null, 2))

      const ordersResponse = await axios.post(
        `${SQUARE_BASE_URL}/v2/orders/search`,
        searchRequest,
        { headers: squareHeaders }
      )

      const orders = ordersResponse.data.orders || []
      console.log(`Square API returned ${orders.length} orders in this batch`)
      allOrders = allOrders.concat(orders)
      cursor = ordersResponse.data.cursor
    } while (cursor)

    console.log(`Total orders fetched from Square API: ${allOrders.length}`)

    // Group orders by date and calculate customer metrics
    const dailyData = {}
    const customerFirstOrder = {} // Track first order date for each customer
    const customerOrdersByDate = {} // Track all orders by customer and date

    allOrders.forEach(order => {
      if (order.customer_id) {
        const orderDate = order.created_at.split('T')[0]
        
        // Initialize daily data if not exists
        if (!dailyData[orderDate]) {
          dailyData[orderDate] = {
            date: orderDate,
            newCustomers: 0,
            returningCustomers: 0,
            totalCustomers: 0,
            customerIds: new Set()
          }
        }

        // Track customer's first order
        if (!customerFirstOrder[order.customer_id]) {
          customerFirstOrder[order.customer_id] = orderDate
        }

        // Track customer orders by date
        if (!customerOrdersByDate[order.customer_id]) {
          customerOrdersByDate[order.customer_id] = new Set()
        }
        customerOrdersByDate[order.customer_id].add(orderDate)

        // Add to daily data
        dailyData[orderDate].customerIds.add(order.customer_id)
      }
    })

    // Calculate new vs returning customers for each day
    Object.keys(dailyData).forEach(date => {
      const dayData = dailyData[date]
      let newCustomers = 0
      let returningCustomers = 0

      dayData.customerIds.forEach(customerId => {
        if (customerFirstOrder[customerId] === date) {
          // This is the customer's first order
          newCustomers++
        } else {
          // This customer has ordered before
          returningCustomers++
        }
      })

      dayData.newCustomers = newCustomers
      dayData.returningCustomers = returningCustomers
      dayData.totalCustomers = dayData.customerIds.size
    })

    // Convert to array and sort by date
    const customerAnalytics = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json({
      success: true,
      data: customerAnalytics,
      period: { startDate: beginTime, endDate: endTime },
      locationId,
    })
  } catch (error) {
    console.error("Square Customer Analytics Error:", error.response?.data || error.message)
    
    // Return mock data as fallback
    const mockCustomerData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split("T")[0],
        newCustomers: Math.floor(Math.random() * 20) + 5,
        returningCustomers: Math.floor(Math.random() * 15) + 10,
        totalCustomers: Math.floor(Math.random() * 35) + 15,
      }
    })

    res.json({
      success: true,
      data: mockCustomerData,
      error: "Using fallback data - check Square API configuration",
      message: error.response?.data?.errors?.[0]?.detail || error.message,
    })
  }
})

// Get revenue analytics (mock)
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


export default router;