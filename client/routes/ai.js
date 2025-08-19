import express from "express"
import axios from "axios"
const router = express.Router()

// AI Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      })
    }

    // Mock AI response for development
    const mockResponses = [
      "Based on your current data, I notice your revenue is up 7.3% this week! Your Kenny's Special Burger is performing exceptionally well.",
      "Your Instagram engagement rate of 8.7% is above the restaurant industry average of 6.2%. Consider posting more content during peak hours (6-8 PM).",
      "I see a 17.1% increase in new customers. This could be attributed to your recent social media campaigns. Keep up the great work!",
      "Your average order value has decreased slightly by 0.6%. Consider implementing upselling strategies or combo deals to increase this metric.",
      "Your returning customer rate of 68.5% is excellent! This indicates strong customer satisfaction and loyalty.",
    ]

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    res.json({
      success: true,
      data: {
        response: randomResponse,
        timestamp: new Date().toISOString(),
        context: context || "general",
      },
    })
  } catch (error) {
    console.error("AI Chat Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to process AI chat request",
      message: error.message,
    })
  }
})

// Get AI insights
router.get("/insights", async (req, res) => {
  try {
    const mockInsights = [
      {
        type: "revenue",
        title: "Revenue Optimization",
        message:
          "Your lunch hours (11 AM - 2 PM) show the highest revenue potential. Consider expanding lunch menu options.",
        priority: "high",
        action: "Expand lunch menu",
      },
      {
        type: "social",
        title: "Social Media Growth",
        message: "Posts featuring food close-ups get 40% more engagement. Focus on high-quality food photography.",
        priority: "medium",
        action: "Improve food photography",
      },
      {
        type: "customer",
        title: "Customer Retention",
        message:
          "Customers who try your desserts have a 25% higher return rate. Promote dessert offerings more actively.",
        priority: "medium",
        action: "Promote desserts",
      },
    ]

    res.json({
      success: true,
      data: mockInsights,
    })
  } catch (error) {
    console.error("AI Insights Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI insights",
      message: error.message,
    })
  }
})

export default router
