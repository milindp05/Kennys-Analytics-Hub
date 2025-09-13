import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { createContext, useContext, useState, useEffect } from "react"
import { ChefHat, Bot } from "lucide-react"
import aiChatService from "./services/aiChatService"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts'

// Simple Auth Context
const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    console.log("Login attempt:", { email, password })
    console.log("Email match:", email === "kenny@meals.com")
    console.log("Password match:", password === "dashboard123")
    
    if (email === "kenny@meals.com" && password === "dashboard123") {
      setUser({ name: "Kenny", email })
      return true
    }
    return false
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")
    
    console.log("Form submitted with:", { email, password })
    
    if (login(email, password)) {
      navigate("/dashboard")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Kenny's Meals Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">Kenny's Analytics Hub</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                placeholder="kenny@meals.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access Analytics Hub
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Demo credentials: kenny@meals.com / dashboard123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [kpis, setKpis] = useState(null)
  const [orders, setOrders] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [salesByHour, setSalesByHour] = useState([])
  const [topMenuItems, setTopMenuItems] = useState([])

  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [customerAnalytics, setCustomerAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("LNBR73NZB7NGD") // Default: Lawrence
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [totalOrdersCount, setTotalOrdersCount] = useState(0)
  const [activeSection, setActiveSection] = useState("dashboard") // "dashboard", "instagram", "settings"
  const [expandedOrders, setExpandedOrders] = useState(new Set())

  // Chat functionality
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hey there! 👋 I'm your AI assistant for Kenny's Meals. I've got access to all your business data, so I can help you with:",
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Add locations mapping
  const locations = [
    { name: "Lawrence", id: "LNBR73NZB7NGD" },
    { name: "Marlton", id: "LHRWZFV9E20FD" },
    { name: "Newtown", id: "LDWVB35FA7CHM" },
  ]

  useEffect(() => {
    fetchSquareData()
    // eslint-disable-next-line
  }, [selectedLocation, startDate, endDate]) // refetch when location or date changes

  // Recalculate top selling meals whenever orders data changes
  useEffect(() => {
    console.log('useEffect triggered for top selling meals:', {
      ordersLength: orders?.length || 0,
      startDate,
      endDate,
      ordersData: orders?.slice(0, 2) // Show first 2 orders for debugging
    })
    
    if (orders && orders.length > 0) {
      console.log('Recalculating top selling meals due to orders change')
      generateTopSellingMeals(orders)
    } else if (orders && orders.length === 0) {
      console.log('No orders available, using fallback data')
      generateTopSellingMeals([])
    }
  }, [orders, startDate, endDate]) // Recalculate when orders or date range changes

  const fetchSquareData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Clear top menu items when fetching new data
      setTopMenuItems([])
      
      console.log('Fetching Square data for date range:', {
        startDate,
        endDate,
        selectedLocation
      })
      
      // Pass locationId, startDate, endDate as query params
      const kpiResponse = await fetch(
        `http://localhost:5000/api/square/kpis?locationId=${selectedLocation}&startDate=${startDate}&endDate=${endDate}`
      )
      const kpiData = await kpiResponse.json()
      console.log('KPI Response:', kpiData)
      
      const ordersResponse = await fetch(
        `http://localhost:5000/api/square/orders?locationId=${selectedLocation}&startDate=${startDate}&endDate=${endDate}`
      )
      const ordersData = await ordersResponse.json()
      console.log('Orders Response:', ordersData)
      console.log('Number of orders received:', ordersData.data?.length || 0)
      console.log('Sample order structure:', ordersData.data?.[0])
      
      // Fetch customer analytics
      const customerResponse = await fetch(
        `http://localhost:5000/api/square/analytics/customers?locationId=${selectedLocation}&startDate=${startDate}&endDate=${endDate}`
      )
      const customerData = await customerResponse.json()
      console.log('Customer Analytics Response:', customerData)
      
      if (kpiData.success) setKpis(kpiData.data)
      if (ordersData.success) {
        setOrders(ordersData.data)
        setTotalOrdersCount(ordersData.totalOrders || ordersData.data.length)
        // Top selling meals will be calculated by useEffect when orders change
      } else {
        console.log('Orders API call failed, creating sample data')
        setOrders([])
      }
      
      if (customerData.success) {
        setCustomerAnalytics(customerData.data)
      } else {
        console.log('Customer Analytics API call failed, using mock data')
        generateMockCustomerAnalytics()
      }
      
      generateMockAnalytics()
    } catch (error) {
      console.error('Error fetching Square data:', error)
      setError('Failed to load Square data. Check your API configuration.')
      // Create sample data if API fails
      generateTopSellingMeals([])
      generateMockCustomerAnalytics()
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalytics = () => {
    // Daily revenue for last 30 days
    const revenue = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 3000) + 1500,
      orders: Math.floor(Math.random() * 80) + 40,
      customers: Math.floor(Math.random() * 60) + 30
    }))
    setRevenueData(revenue)

    // Sales by hour
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      sales: i < 6 || i > 22 ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 300) + 100,
      orders: i < 6 || i > 22 ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 25) + 5
    }))
    setSalesByHour(hourlyData)



    // Monthly trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const trends = months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 1000) + 600,
      customers: Math.floor(Math.random() * 500) + 300
    }))
    setMonthlyTrends(trends)
  }

  const generateMockCustomerAnalytics = () => {
    // Generate mock customer analytics data
    const customerData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split("T")[0],
        newCustomers: Math.floor(Math.random() * 20) + 5,
        returningCustomers: Math.floor(Math.random() * 15) + 10,
        totalCustomers: Math.floor(Math.random() * 35) + 15,
      }
    })
    setCustomerAnalytics(customerData)
  }

  const generateTopSellingMeals = (ordersData) => {
    console.log('=== generateTopSellingMeals called ===')
    console.log('Orders data length:', ordersData?.length, 'orders')
    console.log('Time period for top selling meals:', { startDate, endDate })
    
    if (!ordersData || ordersData.length === 0) {
      console.log('No orders data, using fallback')
      const sampleData = [
        { name: "BBQ Chicken & Roasted Potatoes", sales: 25, revenue: 125.00 },
        { name: "Protein Oats Strawberry Cheesecake", sales: 18, revenue: 72.00 },
        { name: "Spiced Ground Turkey Rice Bowl", sales: 15, revenue: 45.00 },
        { name: "Buffalo Chicken White Mac N Cheese", sales: 12, revenue: 36.00 },
        { name: "Cheesesteak Potato Bowl", sales: 8, revenue: 24.00 }
      ]
      setTopMenuItems(sampleData)
      return
    }

    // Filter orders by the selected date range to ensure accuracy
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    endDateObj.setHours(23, 59, 59, 999) // Include the entire end date

    const filteredOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp)
      return orderDate >= startDateObj && orderDate <= endDateObj
    })

    console.log('Orders after date filtering:', {
      originalCount: ordersData.length,
      filteredCount: filteredOrders.length,
      dateRange: `${startDate} to ${endDate}`
    })

    if (filteredOrders.length === 0) {
      console.log('No orders in selected date range, using fallback')
      const sampleData = [
        { name: "BBQ Chicken & Roasted Potatoes", sales: 25, revenue: 125.00 },
        { name: "Protein Oats Strawberry Cheesecake", sales: 18, revenue: 72.00 },
        { name: "Spiced Ground Turkey Rice Bowl", sales: 15, revenue: 45.00 },
        { name: "Buffalo Chicken White Mac N Cheese", sales: 12, revenue: 36.00 },
        { name: "Cheesesteak Potato Bowl", sales: 8, revenue: 24.00 }
      ]
      setTopMenuItems(sampleData)
      return
    }

    // Create hashmap with meal names as keys and [totalRevenue, totalOrders, totalQuantity] as values
    const mealStats = new Map()
    let totalOrdersProcessed = 0
    let totalItemsProcessed = 0
    let ordersWithItems = 0
    
    console.log('Processing filtered orders for top-selling analysis:', filteredOrders.length, 'orders')
    
    // Sample a few orders to understand the data structure
    if (filteredOrders.length > 0) {
      console.log('Sample filtered order structure:', filteredOrders[0])
    }
    
    filteredOrders.forEach((order, orderIndex) => {
      totalOrdersProcessed++
      
      // Get items from the order (try multiple possible field names)
      let items = []
      if (order.items && Array.isArray(order.items)) {
        items = order.items
      } else if (order.lineItems && Array.isArray(order.lineItems)) {
        items = order.lineItems
      } else if (order.line_items && Array.isArray(order.line_items)) {
        items = order.line_items
      }
      
      if (items && items.length > 0) {
        ordersWithItems++
        
        // Track which meals are in this order to avoid double-counting orders
        const mealsInThisOrder = new Set()
        
        items.forEach((item, itemIndex) => {
          totalItemsProcessed++
          
          // Extract meal name with fallbacks
          const mealName = item.name || 
                          item.display_name || 
                          item.catalog_object_id || 
                          `Item ${item.catalog_object_id || itemIndex}` ||
                          'Unknown Item'
          
          // Filter out gift cards - only process actual meals
          const isGiftCard = mealName.toLowerCase().includes('gift card') ||
                            mealName.toLowerCase().includes('giftcard') ||
                            mealName.toLowerCase().includes('gift') ||
                            item.catalog_object_id?.toLowerCase().includes('gift') ||
                            item.variation_name?.toLowerCase().includes('gift')
          
          if (isGiftCard) {
            console.log('Skipping gift card item:', mealName)
            return // Skip this item
          }
          
          // Extract quantity and price
          const quantity = parseInt(item.quantity) || 1
          const price = parseFloat(item.price) || 
                       parseFloat(item.total_money?.amount) / 100 || 
                       parseFloat(item.base_price_money?.amount) / 100 || 
                       0
          
          const itemRevenue = quantity * price
          
          // Debug first few items
          if (orderIndex < 3 && itemIndex < 2) {
            console.log('Processing meal item:', {
              mealName,
              quantity,
              price,
              itemRevenue,
              originalItem: item
            })
          }
          
          // Update hashmap: [totalRevenue, totalOrders, totalQuantity]
          if (mealStats.has(mealName)) {
            const currentStats = mealStats.get(mealName)
            const isNewOrderForThisMeal = !mealsInThisOrder.has(mealName)
            
            mealStats.set(mealName, [
              currentStats[0] + itemRevenue,  // Add to total revenue
              currentStats[1] + (isNewOrderForThisMeal ? 1 : 0), // Add 1 to order count only if this is a new order for this meal
              currentStats[2] + quantity      // Add to total quantity sold
            ])
          } else {
            mealStats.set(mealName, [itemRevenue, 1, quantity]) // First time seeing this meal = 1 order
          }
          
          // Mark this meal as seen in this order
          mealsInThisOrder.add(mealName)
        })
      }
    })
    
    console.log('Analysis complete:', {
      totalOrdersProcessed,
      totalItemsProcessed,
      ordersWithItems,
      uniqueMeals: mealStats.size,
      mealStats: Object.fromEntries(mealStats)
    })
    
    // Convert hashmap to array and sort by revenue (descending)
    const topMeals = Array.from(mealStats.entries())
      .map(([mealName, [totalRevenue, totalOrders, totalQuantity]]) => ({
        name: mealName,
        sales: totalQuantity,  // Total quantity sold (what we want to display)
        revenue: totalRevenue, // Total revenue
        orders: totalOrders // Total number of orders (for debugging)
      }))
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue (highest first)
      .slice(0, 5) // Get top 5 meals

    console.log('Top 5 meals by revenue:', topMeals)
    
    // If we have real data, use it; otherwise fall back to sample
    if (topMeals.length > 0 && topMeals[0].revenue > 0) {
      console.log('Using real data for top-selling meals')
      console.log('Setting topMenuItems to:', topMeals)
      setTopMenuItems(topMeals)
      console.log('✅ topMenuItems state updated with real data')
    } else {
      console.log('No valid items found, using fallback data')
      const sampleData = [
        { name: "BBQ Chicken & Roasted Potatoes", sales: 25, revenue: 125.00 },
        { name: "Protein Oats Strawberry Cheesecake", sales: 18, revenue: 72.00 },
        { name: "Spiced Ground Turkey Rice Bowl", sales: 15, revenue: 45.00 },
        { name: "Buffalo Chicken White Mac N Cheese", sales: 12, revenue: 36.00 },
        { name: "Cheesesteak Potato Bowl", sales: 8, revenue: 24.00 }
      ]
      setTopMenuItems(sampleData)
      console.log('✅ topMenuItems state updated with fallback data')
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  // Update the handleChatSubmit function to use the AI service
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsTyping(true)

    try {
      // Use the AI service instead of mock responses
      const response = await aiChatService.sendMessage(chatInput.trim(), {
        squareData: {
          // Complete KPIs data from Square API
          kpis: kpis, // Full KPIs object with current/previous/change for all metrics
          
          // Complete orders data
          orders: {
            data: orders, // All order details with items, customers, timestamps
            totalOrders: totalOrdersCount,
            recentOrders: orders?.slice(0, 10) || []
          },
          
          // Revenue and analytics data
          revenueData: revenueData,
          salesByHour: salesByHour,
          monthlyTrends: monthlyTrends,
          
          // Menu performance
          topMenuItems: topMenuItems,
          
          // Location and date context
          location: {
            id: selectedLocation,
            name: locations.find(loc => loc.id === selectedLocation)?.name || 'Kenny\'s Meals'
          },
          dateRange: {
            start: startDate,
            end: endDate
          }
        },
        instagramData: {
          followers: 1250,
          engagement: { rate: 4.2 },
          recentPosts: []
        }
      })

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.success ? response.message : response.error,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Remove the generateAIResponse function since we're using the AI service now

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-gray-100 border-t-gray-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">Kenny's Meals</h2>
          <p className="text-gray-600 text-lg">Loading Performance Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Main Title and Navigation */}
                      <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">Kenny's Meals - Performance Overview</h1>
              </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  CSV
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  PDF
                </button>
              </div>
            </div>
          </div>
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-semibold text-gray-700">Location:</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-semibold text-gray-700">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <span className="text-gray-500 font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
            
            <button 
              onClick={fetchSquareData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-bold">⚠️ Warning:</p>
              <p>{error}</p>
            </div>
          )}

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Revenue */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">REVENUE</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? formatCurrency(kpis.revenue.current) : '$14,802'}
                </p>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">ORDERS</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? kpis.orders.current.toLocaleString() : '687'}
                </p>
                <p className="text-xs text-gray-500 font-medium">All channels</p>
              </div>
            </div>

            {/* AOV */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">AOV</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? formatCurrency(kpis.averageOrderValue.current) : '$21.55'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Sales/Orders</p>
              </div>
            </div>

            {/* New Customers */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">NEW CUSTOMERS</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? kpis.customers.current.toLocaleString() : '272'}
                </p>
              </div>
            </div>

            {/* Returning % */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">RETURNING %</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? `${kpis.returningCustomerRate?.current || 0}%` : '63.2%'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Cohort</p>
              </div>
            </div>


          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Charts */}
            <div className="space-y-8">
              {/* Sales Over Time Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">Sales Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Inter'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* New vs Returning Customers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">New vs Returning Customers</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        color: '#374151',
                        fontFamily: 'Inter'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    />
                    <Legend />
                    <Bar dataKey="newCustomers" stackId="a" fill="#10B981" name="New Customers" />
                    <Bar dataKey="returningCustomers" stackId="a" fill="#8B5CF6" name="Returning Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top-Selling Meals */}
              <div key={`top-meals-${startDate}-${endDate}`} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 font-['Poppins']">Top 5 Selling Meals</h3>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {console.log('Chart data (topMenuItems):', topMenuItems.slice(0, 5))}
                
                <div className="space-y-4">
                  {topMenuItems.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        {/* Rank and Item Info */}
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 
                              'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 font-['Inter'] break-words leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {index === 0 ? '🥇 Best Seller' : 
                               index === 1 ? '🥈 Runner Up' : 
                               index === 2 ? '🥉 Third Place' : 
                               `#${index + 1} Top Seller`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Stats - Fixed width to prevent overflow */}
                        <div className="flex items-center space-x-6 flex-shrink-0">
                          <div className="text-center min-w-[80px]">
                            <p className="text-2xl font-bold text-gray-900 font-['Poppins']">
                              {item.sales?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Quantity</p>
                          </div>
                          <div className="text-center min-w-[100px]">
                            <p className="text-2xl font-bold text-green-600 font-['Poppins']">
                              {formatCurrency(item.revenue || 0)}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Revenue</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Performance</span>
                          <span>{Math.round((item.sales / (topMenuItems[0]?.sales || 1)) * 100)}% of top seller</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 
                              'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${Math.min((item.sales / (topMenuItems[0]?.sales || 1)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {topMenuItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🍽️</div>
                      <p className="text-lg font-medium">No meal data available</p>
                      <p className="text-sm">Check your Square API configuration</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - AI Assistant */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">AI Assistant</h3>
              <div className="flex flex-col" style={{ height: 'calc(100% - 3rem)' }}>
                {/* Chat Messages Area */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto border border-gray-200 min-h-0">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                            <Bot className="h-5 w-5" />
                          </div>
                        )}
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            You
                          </div>
                        )}
                        <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                          <div className={`rounded-lg p-3 shadow-sm border border-gray-200 ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white ml-auto max-w-xs' 
                              : 'bg-white text-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Input Area - Fixed at bottom */}
                <div className="flex-shrink-0 mt-auto">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleChatSubmit(e)
                        }
                      }}
                      placeholder="Ask me about your business data..."
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      disabled={isTyping}
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        handleChatSubmit(e)
                      }}
                      disabled={!chatInput.trim() || isTyping}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const orderId = order.id || `order-${index}`
                  const isExpanded = expandedOrders.has(orderId)
                  
                  return (
                    <div key={orderId} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      {/* Order Header - Clickable */}
                      <div 
                        className="flex justify-between items-center p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => toggleOrderExpansion(orderId)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-400">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 font-['Inter']">Order #{order.id?.slice(-8) || 'N/A'}</p>
                            <p className="text-sm text-gray-500 font-medium">
                              {formatDate(order.createdAt)} • {order.lineItems?.length || 0} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900 font-['Poppins']">
                            {formatCurrency(order.amount || 0)}
                          </p>
                          <p className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded font-medium">
                            {order.state}
                          </p>
                        </div>
                      </div>
                      
                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-100 p-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 text-sm">Order Items:</h4>
                            {order.items && order.items.length > 0 ? (
                              <div className="space-y-2">
                                {order.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex justify-between items-center py-2 px-3 bg-white rounded border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-600">
                                        {item.quantity}x
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {item.name || 'Unknown Item'}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(item.price || 0)}
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        @ {formatCurrency((item.price || 0) / (item.quantity || 1))}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No items found for this order.</p>
                            )}
                            
                            {/* Order Summary */}
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency((order.totalMoney?.amount || 0) / 100)}
                                </span>
                              </div>
                              {order.taxMoney && order.taxMoney.amount > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600">Tax:</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency((order.taxMoney.amount || 0) / 100)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-900">Total:</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency((order.totalMoney?.amount || 0) / 100)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Additional Order Info */}
                            <div className="pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Order ID:</span>
                                  <p className="text-gray-900 font-mono">{order.id || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Status:</span>
                                  <p className="text-gray-900">{order.state || 'Unknown'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Created:</span>
                                  <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Items:</span>
                                  <p className="text-gray-900">{order.lineItems?.length || 0}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📦</div>
                <p>No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
