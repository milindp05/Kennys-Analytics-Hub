import express from "express"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()
const router = express.Router()

// AI Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body

    // Debug logging
    console.log("AI Chat Request:", { message, context: JSON.stringify(context, null, 2) })

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    console.log("OpenAI API Key exists:", !!openaiApiKey)
    console.log("API Key length:", openaiApiKey?.length)

    if (!openaiApiKey || openaiApiKey === "your_openai_api_key_here") {
      console.log("Using fallback response - API key not configured")
      // Fallback to enhanced mock responses with context
      const response = generateContextualResponse(message, context)
      return res.json({
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString(),
          context: context || "general",
        },
      })
    }

    // Create contextual system prompt based on business data
    const systemPrompt = createSystemPrompt(context)
    console.log("System prompt:", systemPrompt)
    
    // Make actual OpenAI API call
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json"
        }
      }
    )

    const aiResponse = openaiResponse.data.choices[0].message.content
    console.log("OpenAI Response:", aiResponse)

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        context: context || "general",
      },
    })
  } catch (error) {
    console.error("AI Chat Error:", error.message)
    console.error("Error details:", error.response?.data)
    
    // Fallback to contextual mock response if OpenAI fails
    const fallbackResponse = generateContextualResponse(req.body.message, req.body.context)
    
    res.json({
      success: true,
      data: {
        response: fallbackResponse + " (Note: Using fallback response due to OpenAI error)",
        timestamp: new Date().toISOString(),
        context: req.body.context || "general",
      },
    })
  }
})

function createSystemPrompt(context) {
  let prompt = `You are Kenny's Meals AI assistant with access to complete real-time business data from Square POS system. You help analyze restaurant performance and provide actionable insights based on actual data. Always reference specific numbers, trends, and insights from the data provided.`
  
  if (context?.squareData) {
    const data = context.squareData
    
    // Complete KPIs data
    if (data.kpis) {
      prompt += `\n\nCOMPLETE BUSINESS KPIs:
- Revenue: $${data.kpis.revenue?.current || 0} (${data.kpis.revenue?.change || 0}% change from previous period)
- Total Orders: ${data.kpis.orders?.current || 0} (${data.kpis.orders?.change || 0}% change)
- Average Order Value: $${data.kpis.averageOrderValue?.current || 0} (${data.kpis.averageOrderValue?.change || 0}% change)
- Unique Customers: ${data.kpis.customers?.current || 0} (${data.kpis.customers?.change || 0}% change)`
    }
    
    // Orders data
    if (data.orders) {
      prompt += `\n\nORDERS DATA:
- Total Orders This Period: ${data.orders.totalOrders || 0}
- Recent Orders Count: ${data.orders.recentOrders?.length || 0}`
      
      if (data.orders.recentOrders?.length > 0) {
        const recentOrderValues = data.orders.recentOrders.map(o => o.amount || 0)
        const avgRecentOrder = recentOrderValues.reduce((a, b) => a + b, 0) / recentOrderValues.length
        prompt += `\n- Average Recent Order Value: $${avgRecentOrder.toFixed(2)}`
      }
    }
    
    // Revenue trends
    if (data.revenueData?.length > 0) {
      const recentRevenue = data.revenueData.slice(-7) // Last 7 days
      const totalRecentRevenue = recentRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0)
      prompt += `\n\nREVENUE TRENDS:
- Last 7 Days Revenue: $${totalRecentRevenue.toFixed(2)}
- Daily Revenue Pattern: ${recentRevenue.map(r => `$${r.revenue || 0}`).join(', ')}`
    }
    
    // Top performing items
    if (data.topMenuItems?.length > 0) {
      prompt += `\n\nTOP PERFORMING ITEMS:
${data.topMenuItems.slice(0, 5).map((item, i) => `${i + 1}. ${item.name}: ${item.quantity || 0} orders, $${item.revenue || 0} revenue`).join('\n')}`
    }
    
    // Location and time context
    prompt += `\n\nCONTEXT:
- Location: ${data.location?.name || 'Kenny\'s Meals'} (ID: ${data.location?.id || 'N/A'})
- Date Range: ${data.dateRange?.start} to ${data.dateRange?.end}`
  }
  
  if (context?.instagramData) {
    const data = context.instagramData
    prompt += `\n\nSOCIAL MEDIA DATA:
- Instagram Followers: ${data.followers || 'N/A'}
- Engagement Rate: ${data.engagement?.rate || 'N/A'}%`
  }
  
  prompt += `\n\nIMPORTANT INSTRUCTIONS:
1. You have access to COMPLETE Square POS data including all orders, revenue, customers, and menu performance
2. Always reference specific numbers from the data above
3. Provide actionable insights based on trends and patterns you see in the data
4. If asked about orders, revenue, or performance, use the exact numbers provided
5. Analyze patterns in the data to give business recommendations
6. Be specific about time periods, locations, and metrics`
  
  return prompt
}

function generateContextualResponse(message, context) {
  const lowerMessage = message.toLowerCase()
  
  // Revenue-related queries
  if (lowerMessage.includes("revenue") || lowerMessage.includes("sales") || lowerMessage.includes("money")) {
    if (context?.squareData?.revenue) {
      const revenue = context.squareData.revenue
      return `Your current revenue is $${revenue.current}. ${revenue.trend === 'up' ? 'Great job! Revenue is trending upward.' : revenue.trend === 'down' ? 'Revenue is declining - consider promoting your top items or implementing promotional strategies.' : 'Revenue is stable.'} Focus on your top-performing items and consider upselling strategies during peak hours.`
    }
    return "Based on typical restaurant patterns, focus on optimizing your menu mix, implementing upselling techniques, and promoting high-margin items during peak hours to boost revenue."
  }
  
  // Order-related queries
  if (lowerMessage.includes("order") || lowerMessage.includes("customer")) {
    if (context?.squareData?.orders) {
      const orders = context.squareData.orders
      return `You've processed ${orders.total} orders. ${orders.trend === 'up' ? 'Order volume is increasing - great customer retention!' : 'Consider implementing customer retention strategies.'} Focus on providing consistent quality and consider a loyalty program to encourage repeat visits.`
    }
    return "To improve order volume, focus on customer experience, implement a loyalty program, and optimize your menu for popular items. Consider delivery partnerships and social media marketing."
  }
  
  // Social media queries
  if (lowerMessage.includes("instagram") || lowerMessage.includes("social")) {
    if (context?.instagramData) {
      const instagram = context.instagramData
      return `Your Instagram has ${instagram.followers} followers with ${instagram.engagement?.rate}% engagement rate. ${instagram.engagement?.rate > 3 ? 'Excellent engagement!' : 'Consider improving content quality.'} Post high-quality food photos during peak hours (6-8 PM) and use trending food hashtags.`
    }
    return "For Instagram success: Post high-quality food photos, use trending hashtags, engage with followers, post during peak hours (6-8 PM), and showcase behind-the-scenes content."
  }
  
  // Menu optimization
  if (lowerMessage.includes("menu") || lowerMessage.includes("food") || lowerMessage.includes("item")) {
    if (context?.squareData?.topItems?.length > 0) {
      const topItem = context.squareData.topItems[0]
      return `Your ${topItem.name} is your top performer! Consider creating variations or combo deals around this item. Analyze slow-moving items and either improve them or replace them with customer favorites.`
    }
    return "Analyze your menu performance data to identify top and bottom performers. Create combo deals around popular items, consider seasonal specials, and optimize pricing for maximum profitability."
  }
  
  // General/default response
  return "I can help you analyze your restaurant's performance! Ask me about revenue trends, customer insights, menu optimization, or social media strategy. I have access to your Square POS and Instagram data to provide specific recommendations."
}

// Get AI insights
router.get("/insights", async (req, res) => {
  try {
    const mockInsights = [
      {
        type: "revenue",
        title: "Revenue Optimization Opportunity",
        message: "Your lunch hours (11 AM - 2 PM) show 35% higher order values. Consider expanding lunch menu options and promoting lunch specials.",
        priority: "high",
        action: "Create lunch promotion campaign",
      },
      {
        type: "social",
        title: "Instagram Engagement Growth",
        message: "Food close-up posts receive 40% more engagement than wide shots. Invest in better food photography to boost your social media reach.",
        priority: "medium",
        action: "Improve food photography",
      },
      {
        type: "customer",
        title: "Customer Retention Strategy",
        message: "Customers who order desserts have 25% higher return rates. Actively promote your dessert offerings to boost customer loyalty.",
        priority: "medium",
        action: "Launch dessert promotion",
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
