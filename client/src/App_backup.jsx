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
    
    if (login(email, password)) {
      navigate("/dashboard")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border-t-4 border-orange-500">
        <h2 className="text-2xl font-bold text-center mb-6">Login to Kenny's Meals</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email"
              type="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder=""
              defaultValue=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              name="password"
              type="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="dashboard123"
              defaultValue="dashboard123"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
          >
            Sign In
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
    setTopMenuItems(menuItems)

    // Customer segments
    const segments = [
      { name: 'Regular Customers', value: 45, color: '#FF6B35' },
      { name: 'New Customers', value: 30, color: '#F7931E' },
      { name: 'VIP Customers', value: 15, color: '#FFD23F' },
      { name: 'Returning Customers', value: 10, color: '#06D6A0' }
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Square data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-orange-100 to-yellow-100 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-900">Kenny's Meals Dashboard</h1>
            
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchSquareData}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Refresh Data
            </button>
            <span className="text-orange-700">Welcome, {user?.name}!</span>
            <button 
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Warning:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {kpis ? formatCurrency(kpis.revenue.current) : '$0.00'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.revenue.change >= 0 ? '+' : ''}{kpis.revenue.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Orders</h3>
              <p className="text-3xl font-bold text-orange-600">
                {kpis ? kpis.orders.current.toLocaleString() : '0'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.orders.change >= 0 ? '+' : ''}{kpis.orders.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Avg Order Value</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {kpis ? formatCurrency(kpis.averageOrderValue.current) : '$0.00'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.averageOrderValue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.averageOrderValue.change >= 0 ? '+' : ''}{kpis.averageOrderValue.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-lg shadow-md p-6 border-l-4 border-orange-400">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Customers</h3>
              <p className="text-3xl font-bold text-orange-600">
                {kpis ? kpis.customers.current.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-orange-600">Unique customers</p>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg shadow-md p-6 border-l-4 border-green-400">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div key={order.id || index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">Order #{order.id?.slice(-8) || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)} • {order.lineItems?.length || 0} items
                      </p>
                      {order.lineItems && order.lineItems.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {order.lineItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency((order.totalMoney?.amount || 0) / 100)}
                      </p>
                      <p className="text-sm text-gray-600">{order.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-orange-600 text-center py-8">
                No recent orders found. Check your Square API configuration.
              </p>
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
