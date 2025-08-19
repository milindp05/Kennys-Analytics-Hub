class InstagramAPIService {
  constructor() {
    this.baseURL = "https://graph.instagram.com"
    this.accessToken = process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || "mock-token"
    this.userId = process.env.REACT_APP_INSTAGRAM_USER_ID || "mock-user-id"
  }

  // Mock data generator for development
  generateMockData(dateRange = "7d") {
    const now = new Date()
    const days = Number.parseInt(dateRange.replace("d", ""))

    // Generate realistic Instagram metrics
    const baseFollowers = 12847
    const baseEngagement = 4.2
    const baseReach = 8934
    const baseImpressions = 15672

    return {
      profile: {
        username: "kennysmeals",
        followersCount: baseFollowers + Math.floor(Math.random() * 200 - 50),
        followingCount: 892,
        mediaCount: 347,
        biography: "🍔 Delicious meals made with love | 📍 Downtown Location | 🕒 Open Daily 11AM-10PM",
        profilePictureUrl: "/kenny-avatar.png",
        website: "https://kennysmeals.com",
      },
      insights: {
        followerChange: {
          value: Math.floor(Math.random() * 100 + 20),
          change: this.getRandomChange(),
          trend: Math.random() > 0.3 ? "up" : "down",
          period: `Last ${days} days`,
        },
        engagement: {
          rate: baseEngagement + (Math.random() * 2 - 1),
          change: this.getRandomChange(),
          trend: "up",
          totalLikes: Math.floor(Math.random() * 500 + 200),
          totalComments: Math.floor(Math.random() * 100 + 30),
        },
        reach: {
          value: Math.floor(baseReach * (days / 7)),
          change: this.getRandomChange(),
          trend: "up",
          period: `Last ${days} days`,
        },
        impressions: {
          value: Math.floor(baseImpressions * (days / 7)),
          change: this.getRandomChange(),
          trend: "up",
          period: `Last ${days} days`,
        },
        topPosts: this.generateTopPosts(),
        audienceInsights: this.generateAudienceInsights(),
        hashtagPerformance: this.generateHashtagData(),
        dailyMetrics: this.generateDailyMetrics(days),
      },
    }
  }

  getRandomChange() {
    const changes = ["+12.5%", "+8.2%", "+15.3%", "+3.1%", "+22.7%", "+5.8%", "-2.1%", "+18.9%", "+6.4%"]
    return changes[Math.floor(Math.random() * changes.length)]
  }

  generateTopPosts() {
    const postTypes = ["image", "carousel", "video"]
    const captions = [
      "Our signature burger is back! 🍔✨",
      "Fresh ingredients, fresh flavors 🥗",
      "Behind the scenes in Kenny's kitchen 👨‍🍳",
      "Weekend special: Fish & Chips 🐟🍟",
      "Customer favorite: Chicken Wings 🍗",
      "New menu item alert! 🚨",
    ]

    return Array.from({ length: 6 }, (_, i) => ({
      id: `post_${i + 1}`,
      mediaType: postTypes[Math.floor(Math.random() * postTypes.length)],
      caption: captions[i] || `Delicious meal #${i + 1}`,
      likes: Math.floor(Math.random() * 200 + 50),
      comments: Math.floor(Math.random() * 30 + 5),
      shares: Math.floor(Math.random() * 15 + 2),
      reach: Math.floor(Math.random() * 1000 + 300),
      impressions: Math.floor(Math.random() * 1500 + 500),
      engagement: Math.round((Math.random() * 8 + 2) * 100) / 100,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnailUrl: `/placeholder.svg?height=300&width=300&query=food-post-${i + 1}`,
    }))
  }

  generateAudienceInsights() {
    return {
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
        topCities: [
          { city: "New York", percentage: 45 },
          { city: "Brooklyn", percentage: 23 },
          { city: "Queens", percentage: 18 },
          { city: "Manhattan", percentage: 14 },
        ],
      },
      activity: {
        peakHours: [
          { hour: "12:00 PM", engagement: 85 },
          { hour: "6:00 PM", engagement: 92 },
          { hour: "8:00 PM", engagement: 78 },
        ],
        peakDays: [
          { day: "Friday", engagement: 95 },
          { day: "Saturday", engagement: 88 },
          { day: "Sunday", engagement: 82 },
        ],
      },
    }
  }

  generateHashtagData() {
    const hashtags = [
      "#kennysmeals",
      "#foodie",
      "#burger",
      "#delicious",
      "#restaurant",
      "#foodporn",
      "#yummy",
      "#fresh",
      "#local",
      "#tasty",
    ]

    return hashtags.map((tag) => ({
      hashtag: tag,
      reach: Math.floor(Math.random() * 2000 + 500),
      impressions: Math.floor(Math.random() * 3000 + 800),
      uses: Math.floor(Math.random() * 50 + 10),
    }))
  }

  generateDailyMetrics(days) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
      return {
        date: date.toISOString().split("T")[0],
        followers: Math.floor(Math.random() * 50 + 10),
        likes: Math.floor(Math.random() * 100 + 30),
        comments: Math.floor(Math.random() * 20 + 5),
        reach: Math.floor(Math.random() * 800 + 200),
        impressions: Math.floor(Math.random() * 1200 + 400),
        engagement: Math.round((Math.random() * 6 + 2) * 100) / 100,
      }
    })
  }

  // Main API methods
  async getInsights(dateRange = "7d") {
    try {
      // In production, make actual API call:
      // const response = await fetch(`${this.baseURL}/me/insights?access_token=${this.accessToken}`)

      // For now, return mock data
      await this.simulateNetworkDelay()
      return this.generateMockData(dateRange)
    } catch (error) {
      console.error("Instagram API Error:", error)
      throw new Error("Failed to fetch Instagram insights")
    }
  }

  async getMedia(limit = 12) {
    try {
      await this.simulateNetworkDelay()

      // Mock media data
      return {
        data: Array.from({ length: limit }, (_, i) => ({
          id: `media_${i + 1}`,
          mediaType: ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"][Math.floor(Math.random() * 3)],
          mediaUrl: `/placeholder.svg?height=400&width=400&query=instagram-post-${i + 1}`,
          permalink: `https://instagram.com/p/mock_${i + 1}`,
          caption: `Delicious food post #${i + 1} 🍔✨ #kennysmeals #foodie`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      }
    } catch (error) {
      console.error("Instagram Media API Error:", error)
      throw new Error("Failed to fetch Instagram media")
    }
  }

  async simulateNetworkDelay() {
    // Simulate realistic API response time
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 300))
  }

  // Utility methods
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  formatEngagement(rate) {
    return `${rate.toFixed(1)}%`
  }
}

export default new InstagramAPIService()
