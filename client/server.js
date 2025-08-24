import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import dotenv from "dotenv"
dotenv.config()

import squareRoutes from "./routes/square.js"
import instagramRoutes from "./routes/instagram.js"
import aiRoutes from "./routes/ai.js"
import authRoutes from "./routes/auth.js"

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Logging
app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// API routes
app.use("/api/square", squareRoutes)
app.use("/api/instagram", instagramRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/auth", authRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(200).json({ message: "Backend running" })
})

app.listen(PORT, () => {
  console.log(`🚀 Kenny's Meals Backend running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
})
