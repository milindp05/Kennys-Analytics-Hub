import express from "express"
const router = express.Router()

// Mock authentication for development
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Mock authentication - replace with real auth logic
    if (email === "kenny@meals.com" && password === "dashboard123") {
      const mockUser = {
        id: "user_001",
        email: "kenny@meals.com",
        name: "Kenny Rodriguez",
        role: "owner",
        avatar: "/diverse-user-avatars.png",
      }

      res.json({
        success: true,
        data: {
          user: mockUser,
          token: "mock_jwt_token_" + Date.now(),
        },
      })
    } else {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }
  } catch (error) {
    console.error("Auth Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: error.message,
    })
  }
})

// Verify token
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (token && token.startsWith("mock_jwt_token_")) {
    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: "user_001",
          email: "kenny@meals.com",
          name: "Kenny Rodriguez",
          role: "owner",
        },
      },
    })
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    })
  }
})

export default router
