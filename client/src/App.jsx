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

  useEffect(() => {
    fetchSquareData()
  }, [])

  const fetchSquareData = async () => {
    try {
      setLoading(true)
      
      // Fetch KPIs from Square API
      const kpiResponse = await fetch('http://localhost:5000/api/square/kpis')
      const kpiData = await kpiResponse.json()
      
      // Fetch recent orders
      const ordersResponse = await fetch('http://localhost:5000/api/square/orders?limit=10')
      const ordersData = await ordersResponse.json()
      
      if (kpiData.success) {
        setKpis(kpiData.data)
      }
      
      if (ordersData.success) {
        setOrders(ordersData.data)
      }

      // Generate mock analytics data (in real app, these would be additional API endpoints)
      generateMockAnalytics()
      
    } catch (error) {
      console.error('Error fetching Square data:', error)
      setError('Failed to load Square data. Check your API configuration.')
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

    // Top menu items
    const menuItems = [
      { name: "Kenny's Special Burger", sales: 245, revenue: 6125, percentage: 25 },
      { name: "Grilled Chicken Salad", sales: 189, revenue: 3402, percentage: 19 },
      { name: "Fish & Chips", sales: 156, revenue: 3744, percentage: 16 },
      { name: "Veggie Wrap", sales: 134, revenue: 2144, percentage: 14 },
      { name: "BBQ Ribs", sales: 98, revenue: 2940, percentage: 10 },
      { name: "Caesar Salad", sales: 87, revenue: 1740, percentage: 9 },
      { name: "Chicken Wings", sales: 76, revenue: 1520, percentage: 7 }
    ]
    console.log('Setting topMenuItems:', menuItems)
    setTopMenuItems(menuItems)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Advanced Navigation */}
      <nav className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-indigo-900/50 backdrop-blur-md shadow-2xl px-6 py-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Kenny's Analytics Hub
              </h1>
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full border border-amber-500/30 backdrop-blur-sm">
                mock data version
              </span>
            </div>
            <p className="text-blue-300 text-sm">Advanced Square POS Analytics • Real-time Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchSquareData}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Refresh Data
            </button>
            <span className="text-blue-200">Welcome, {user?.name}!</span>
            <button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm">
              <p className="font-bold">⚠️ Warning:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90 mb-2">Total Revenue</h3>
                  <p className="text-4xl font-bold mb-2">
                    {kpis ? formatCurrency(kpis.revenue.current) : '$0.00'}
                  </p>
                  {kpis && (
                    <p className="text-sm opacity-80">
                      {kpis.revenue.change >= 0 ? '📈' : '📉'} {kpis.revenue.change >= 0 ? '+' : ''}{kpis.revenue.change}% vs last period
                    </p>
                  )}
                </div>
                <div className="text-5xl opacity-20">💰</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90 mb-2">Total Orders</h3>
                  <p className="text-4xl font-bold mb-2">
                    {kpis ? kpis.orders.current.toLocaleString() : '0'}
                  </p>
                  {kpis && (
                    <p className="text-sm opacity-80">
                      {kpis.orders.change >= 0 ? '📈' : '📉'} {kpis.orders.change >= 0 ? '+' : ''}{kpis.orders.change}% vs last period
                    </p>
                  )}
                </div>
                <div className="text-5xl opacity-20">📋</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-yellow-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90 mb-2">Avg Order Value</h3>
                  <p className="text-4xl font-bold mb-2">
                    {kpis ? formatCurrency(kpis.averageOrderValue.current) : '$0.00'}
                  </p>
                  {kpis && (
                    <p className="text-sm opacity-80">
                      {kpis.averageOrderValue.change >= 0 ? '📈' : '📉'} {kpis.averageOrderValue.change >= 0 ? '+' : ''}{kpis.averageOrderValue.change}% vs last period
                    </p>
                  )}
                </div>
                <div className="text-5xl opacity-20">💳</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold opacity-90 mb-2">Customers</h3>
                  <p className="text-4xl font-bold mb-2">
                    {kpis ? kpis.customers.current.toLocaleString() : '0'}
                  </p>
                  <p className="text-sm opacity-80">Unique customers</p>
                </div>
                <div className="text-5xl opacity-20">👥</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Revenue Trend Chart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
                📊 Revenue Trends (30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#revenueGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Sales Pattern */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
                ⏰ Hourly Sales Pattern
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByHour}>
                  <defs>
                    <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="sales" fill="url(#hourlyGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Second Row of Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Customer Segments Pie Chart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-6">
                👥 Customer Segments
              </h3>
              <ResponsiveContainer width="100%" height={250}>
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
                      backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#F3F4F6'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Menu Items */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                🍔 Top Menu Items Performance
              </h3>
              {topMenuItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <p>Loading menu items data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topMenuItems} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value, name) => [value, name === 'sales' ? 'Sales Count' : name]}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#F59E0B" 
                      stroke="#EA580C"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>

          {/* Monthly Trends */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
              📈 Monthly Performance Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="ordersLineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    color: '#F3F4F6'
                  }} 
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#revenueLineGradient)" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders with Enhanced Design */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
              🧾 Recent Orders Analysis
            </h3>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={order.id || index} className="bg-gradient-to-r from-gray-800/50 to-blue-800/30 rounded-2xl p-6 border border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-blue-200">Order #{order.id?.slice(-8) || 'N/A'}</p>
                        <p className="text-sm text-gray-400">
                          {formatDate(order.createdAt)} • {order.lineItems?.length || 0} items
                        </p>
                        {order.lineItems && order.lineItems.length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            {order.lineItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-3xl bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          {formatCurrency((order.totalMoney?.amount || 0) / 100)}
                        </p>
                        <p className="text-sm text-gray-400 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                          {order.state}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 text-lg">No recent orders found. Check your Square API configuration.</p>
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
