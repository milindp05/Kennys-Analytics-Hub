import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { createContext, useContext, useState, useEffect } from "react"

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
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
              placeholder="kenny@meals.com"
              defaultValue="kenny@meals.com"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
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
      const ordersResponse = await fetch('http://localhost:5000/api/square/orders?limit=5')
      const ordersData = await ordersResponse.json()
      
      if (kpiData.success) {
        setKpis(kpiData.data)
      }
      
      if (ordersData.success) {
        setOrders(ordersData.data)
      }
      
    } catch (error) {
      console.error('Error fetching Square data:', error)
      setError('Failed to load Square data. Check your API configuration.')
    } finally {
      setLoading(false)
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
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kenny's Meals Dashboard</h1>
            <p className="text-sm text-gray-600">Real-time Square data</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchSquareData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Refresh Data
            </button>
            <span className="text-gray-700">Welcome, {user?.name}!</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Warning:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {kpis ? formatCurrency(kpis.revenue.current) : '$0.00'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.revenue.change >= 0 ? '+' : ''}{kpis.revenue.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Orders</h3>
              <p className="text-3xl font-bold text-blue-600">
                {kpis ? kpis.orders.current.toLocaleString() : '0'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.orders.change >= 0 ? '+' : ''}{kpis.orders.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                {kpis ? formatCurrency(kpis.averageOrderValue.current) : '$0.00'}
              </p>
              {kpis && (
                <p className={`text-sm ${kpis.averageOrderValue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.averageOrderValue.change >= 0 ? '+' : ''}{kpis.averageOrderValue.change}% vs previous period
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Customers</h3>
              <p className="text-3xl font-bold text-orange-600">
                {kpis ? kpis.customers.current.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-600">Unique customers</p>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h3>
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
              <p className="text-gray-600 text-center py-8">
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
