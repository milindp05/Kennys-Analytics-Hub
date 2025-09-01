import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { createContext, useContext, useState, useEffect } from "react"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Kenny's Analytics Hub
        </h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
          >
            Access Analytics Hub
          </button>
        </form>
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
  const [customerSegments, setCustomerSegments] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
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

  // Add locations mapping
  const locations = [
    { name: "Lawrence", id: "LNBR73NZB7NGD" },
    { name: "Marlton", id: "LHRWZFV9E20FD" },
    { name: "Newtown", id: "LDWVB35FA7CHM" },
  ]

  useEffect(() => {
    fetchSquareData()
    // eslint-disable-next-line
  }, [selectedLocation, startDate, endDate]) // refetch when location changes

  const fetchSquareData = async () => {
    try {
      setLoading(true)
      setError("")
      // Pass locationId, startDate, endDate as query params
      const kpiResponse = await fetch(
        `http://localhost:5000/api/square/kpis?locationId=${selectedLocation}&startDate=${startDate}&endDate=${endDate}`
      )
      const kpiData = await kpiResponse.json()
      console.log('KPI Response:', kpiData)
      
      const ordersResponse = await fetch(
        `http://localhost:5000/api/square/orders?limit=100&locationId=${selectedLocation}&startDate=${startDate}&endDate=${endDate}`
      )
      const ordersData = await ordersResponse.json()
      console.log('Orders Response:', ordersData)
      
      if (kpiData.success) setKpis(kpiData.data)
      if (ordersData.success) {
        setOrders(ordersData.data)
        setTotalOrdersCount(ordersData.totalOrders || ordersData.data.length)
        // Generate top selling meals from actual Square data
        generateTopSellingMeals(ordersData.data)
      } else {
        console.log('Orders API call failed, creating sample data')
        generateTopSellingMeals([])
      }
      
      generateMockAnalytics()
    } catch (error) {
      console.error('Error fetching Square data:', error)
      setError('Failed to load Square data. Check your API configuration.')
      // Create sample data if API fails
      generateTopSellingMeals([])
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

    // Customer segments
    const segments = [
      { name: 'Regular Customers', value: 45, color: '#8B5CF6' },
      { name: 'New Customers', value: 30, color: '#10B981' },
      { name: 'VIP Customers', value: 15, color: '#F59E0B' },
      { name: 'Returning Customers', value: 10, color: '#EF4444' }
    ]
    setCustomerSegments(segments)

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

  const generateTopSellingMeals = (ordersData) => {
    console.log('generateTopSellingMeals called with:', ordersData)
    
    if (!ordersData || ordersData.length === 0) {
      console.log('No orders data, setting empty array')
      setTopMenuItems([])
      return
    }

    // Create a map to aggregate item sales
    const itemSales = new Map()

    ordersData.forEach(order => {
      console.log('Processing order:', order)
      if (order.lineItems && order.lineItems.length > 0) {
        order.lineItems.forEach(item => {
          console.log('Processing line item:', item)
          const itemName = item.name || 'Unknown Item'
          const quantity = item.quantity || 1
          const itemPrice = (item.basePriceMoney?.amount || 0) / 100
          const totalPrice = (item.totalMoney?.amount || 0) / 100

          if (itemSales.has(itemName)) {
            const existing = itemSales.get(itemName)
            existing.sales += quantity
            existing.revenue += totalPrice
            existing.orderCount += 1
          } else {
            itemSales.set(itemName, {
              name: itemName,
              sales: quantity,
              revenue: totalPrice,
              orderCount: 1,
              avgPrice: itemPrice
            })
          }
        })
      } else {
        console.log('Order has no line items:', order)
      }
    })

    // Convert to array and sort by sales volume
    const topItems = Array.from(itemSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10) // Top 10 items

    // Calculate percentages
    const totalSales = topItems.reduce((sum, item) => sum + item.sales, 0)
    topItems.forEach(item => {
      item.percentage = totalSales > 0 ? Math.round((item.sales / totalSales) * 100) : 0
    })

    console.log('Generated top selling meals from Square data:', topItems)
    
    // If no items found, create some sample data for testing
    if (topItems.length === 0) {
      console.log('No items found, creating sample data')
      const sampleData = [
        { name: "Sample Burger", sales: 25, revenue: 125.00, percentage: 30 },
        { name: "Sample Salad", sales: 18, revenue: 72.00, percentage: 22 },
        { name: "Sample Fries", sales: 15, revenue: 45.00, percentage: 18 },
        { name: "Sample Drink", sales: 12, revenue: 36.00, percentage: 15 },
        { name: "Sample Dessert", sales: 8, revenue: 24.00, percentage: 10 }
      ]
      setTopMenuItems(sampleData)
    } else {
      setTopMenuItems(topItems)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-blue-200 text-lg">Loading Advanced Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Main Title and Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">Kenny's Meals - Performance Overview</h1>
              <div className="flex space-x-6 text-sm font-semibold text-gray-600 font-['Inter']">
                <span className="text-blue-600">Sales</span>
                <span>•</span>
                <span>Customers</span>
                <span>•</span>
                <span>Instagram</span>
                <span>•</span>
                <span>Stores</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Refresh
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Revenue */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">REVENUE</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">
                  {kpis ? formatCurrency(kpis.revenue.current) : '$14,802'}
                </p>
                <p className="text-xs text-gray-500 font-medium">7d</p>
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
                <p className="text-xs text-gray-500 font-medium">Last 7 days</p>
              </div>
            </div>

            {/* Returning % */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">RETURNING %</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1 font-['Poppins']">63.2%</p>
                <p className="text-xs text-gray-500 font-medium">Cohort</p>
              </div>
            </div>

            {/* IG Follower Δ */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-600 mb-2 tracking-wide">IG FOLLOWER Δ</h3>
                <p className="text-2xl font-bold text-green-600 mb-1 font-['Poppins']">+2.3%</p>
                <p className="text-xs text-gray-500 font-medium">vs prev period</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
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

            {/* Instagram Mix Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">Instagram Mix</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      color: '#374151',
                      fontFamily: 'Inter'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Second Row of Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* New vs Returning Customers */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">New vs Returning Customers</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      color: '#374151',
                      fontFamily: 'Inter'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="revenue" stackId="a" fill="#86EFAC" />
                  <Bar dataKey="orders" stackId="a" fill="#C084FC" />
                </BarChart>
              </ResponsiveContainer>
            </div>

                         {/* Top-Selling Meals */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
               <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">Top-Selling Meals</h3>
               {topMenuItems.length === 0 ? (
                 <div className="text-center py-12 text-gray-500">
                   <div className="text-4xl mb-4">🍽️</div>
                   <p>No meal data available. Check your Square API configuration.</p>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={topMenuItems} layout="horizontal" margin={{ left: 150, right: 20, top: 20, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                     <XAxis type="number" stroke="#6B7280" />
                     <YAxis 
                       dataKey="name" 
                       type="category" 
                       stroke="#6B7280" 
                       width={150}
                       tick={{ fontSize: 12 }}
                       axisLine={false}
                       tickLine={false}
                     />
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: 'white', 
                         border: '1px solid #E5E7EB', 
                         borderRadius: '8px',
                         color: '#374151',
                         fontFamily: 'Inter'
                       }}
                       formatter={(value, name, props) => [
                         `${value} units sold`,
                         `Sales Count`
                       ]}
                       labelFormatter={(label) => {
                         const item = topMenuItems.find(item => item.name === label)
                         return item ? `Revenue: $${item.revenue?.toFixed(2) || '0.00'}` : label
                       }}
                     />
                     <Bar dataKey="sales" fill="#F9A8D4" radius={[0, 4, 4, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               )}
             </div>

          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Notes & To-Dos */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">Notes & To-Dos</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-600 text-sm font-semibold">Add labor cost feed (v2)</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 text-sm font-semibold">Enable scheduled exports</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-600 text-sm font-semibold">Map Square item IDs → Meals</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600 text-sm font-semibold">Connect IG media insights</span>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Poppins']">AI Assistant</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 text-sm font-medium">
                  Ask me things like: "Today's sales by store?" or "Top 5 items this week"
                </p>
              </div>
            </div>

          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
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
                            {formatCurrency((order.totalMoney?.amount || 0) / 100)}
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
                            {order.lineItems && order.lineItems.length > 0 ? (
                              <div className="space-y-2">
                                {order.lineItems.map((item, itemIndex) => (
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
                                        {formatCurrency((item.totalMoney?.amount || 0) / 100)}
                                      </span>
                                      {item.basePriceMoney && (
                                        <p className="text-xs text-gray-500">
                                          @ {formatCurrency((item.basePriceMoney.amount || 0) / 100)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No item details available</p>
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
              <div className="text-center py-8 text-gray-500 font-medium">
                No recent orders found. Check your Square API configuration.
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
