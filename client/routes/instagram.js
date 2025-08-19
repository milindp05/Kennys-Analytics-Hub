import express from "express"
import axios from "axios"
const router = express.Router()

const INSTAGRAM_BASE_URL = "https://graph.instagram.com"

// Get Instagram insights
router.get("/insights", async (req, res) => {
  try {
    const { period = "7d" } = req.query

    // Mock Instagram insights data
    const mockInsights = {
      followers: {
        current: 12847,
        previous: 12456,
        change: 3.1,
      },
      engagement: {
        current: 8.7,
        previous: 7.9,
        change: 10.1,
      },
      reach: {
        current: 45230,
        previous: 41200,
        change: 9.8,
      },
      impressions: {
        current: 67890,
        previous: 62100,
        change: 9.3,
      },
      profileViews: {
        current: 2340,
        previous: 2180,
        change: 7.3,
      },
    }

    res.json({
      success: true,
      data: mockInsights,
      period,
    })
  } catch (error) {
    console.error("Instagram Insights Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch Instagram insights",
      message: error.message,
    })
  }
})

// Get top posts
router.get("/posts/top", async (req, res) => {
  try {
    const mockTopPosts = [
      {
        id: "post_001",
        mediaUrl: "/delicious-burger.png",
        caption: "Our signature Kenny's Special Burger! 🍔",
        likes: 1247,
        comments: 89,
        engagement: 10.4,
      },
      {
        id: "post_002",
        mediaUrl: "/fresh-salad.png",
        caption: "Fresh and healthy options available daily! 🥗",
        likes: 892,
        comments: 56,
        engagement: 8.7,
      },
      {
        id: "post_003",
        mediaUrl: "/modern-restaurant-interior.png",
        caption: "Come dine with us in our cozy atmosphere! ✨",
        likes: 756,
        comments: 43,
        engagement: 7.2,
      },
    ]

    res.json({
      success: true,
      data: mockTopPosts,
    })
  } catch (error) {
    console.error("Instagram Top Posts Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch top posts",
      message: error.message,
    })
  }
})

// Get audience insights
router.get("/audience", async (req, res) => {
  try {
    const mockAudienceData = {
      demographics: {
        ageGroups: [
          { range: "18-24", percentage: 15 },
          { range: "25-34", percentage: 35 },
          { range: "35-44", percentage: 28 },
          { range: "45-54", percentage: 15 },
          { range: "55+", percentage: 7 },
        ],
        gender: [
          { type: "Female", percentage: 58 },
          { type: "Male", percentage: 42 },
        ],
      },
      topLocations: [
        { city: "New York", percentage: 25 },
        { city: "Los Angeles", percentage: 18 },
        { city: "Chicago", percentage: 12 },
        { city: "Houston", percentage: 8 },
        { city: "Phoenix", percentage: 6 },
      ],
    }

    res.json({
      success: true,
      data: mockAudienceData,
    })
  } catch (error) {
    console.error("Instagram Audience Error:", error.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch audience insights",
      message: error.message,
    })
  }
})

export default router
