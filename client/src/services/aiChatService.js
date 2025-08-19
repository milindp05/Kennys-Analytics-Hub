class AIChatService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || "mock-api-key"
    this.baseURL = "https://api.openai.com/v1"
    this.model = "gpt-4"
  }

  // Mock responses for development
  getMockResponse(message) {
    const responses = {
      revenue:
        "Based on your current data, revenue is trending upward with a 12.5% increase. Consider promoting your top-performing items like the Signature Burger to maximize this trend.",
      orders:
        "Your order volume shows strong performance. The 8.2% increase suggests good customer retention. Focus on delivery optimization during peak hours.",
      customers:
        "New customer acquisition is excellent at +15.3%. Consider implementing a loyalty program to convert these into returning customers.",
      instagram:
        "Your Instagram engagement is performing well at 4.2%. Try posting during peak hours (6-8 PM) and use trending food hashtags to increase reach.",
      menu: "Your Signature Burger and Chicken Wings are top performers. Consider creating combo deals or limited-time variations to boost sales further.",
      analytics:
        "Your analytics show strong performance across all metrics. Focus on maintaining consistency in service quality and consider expanding successful menu items.",
      default:
        "I'm here to help you analyze your restaurant's performance! Ask me about revenue trends, customer insights, menu optimization, or social media strategy.",
    }

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("revenue") || lowerMessage.includes("sales")) {
      return responses.revenue
    }
    if (lowerMessage.includes("order") || lowerMessage.includes("volume")) {
      return responses.orders
    }
    if (lowerMessage.includes("customer") || lowerMessage.includes("retention")) {
      return responses.customers
    }
    if (lowerMessage.includes("instagram") || lowerMessage.includes("social")) {
      return responses.instagram
    }
    if (lowerMessage.includes("menu") || lowerMessage.includes("food") || lowerMessage.includes("item")) {
      return responses.menu
    }
    if (lowerMessage.includes("analytics") || lowerMessage.includes("performance")) {
      return responses.analytics
    }

    return responses.default
  }

  async sendMessage(message, context = {}) {
    try {
      // In production, make actual OpenAI API call:
      // const response = await fetch(`${this.baseURL}/chat/completions`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     model: this.model,
      //     messages: [
      //       {
      //         role: 'system',
      //         content: 'You are an AI assistant for Kenny\'s Meals restaurant dashboard. Help analyze business data and provide actionable insights.'
      //       },
      //       {
      //         role: 'user',
      //         content: message
      //       }
      //     ],
      //     max_tokens: 150,
      //     temperature: 0.7
      //   })
      // })

      // For now, simulate API delay and return mock response
      await this.simulateDelay()
      return {
        success: true,
        message: this.getMockResponse(message),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("AI Chat Error:", error)
      return {
        success: false,
        error: "Failed to get AI response. Please try again.",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async simulateDelay() {
    // Simulate realistic API response time
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))
  }

  // Generate contextual suggestions based on dashboard data
  generateSuggestions(squareData, instagramData) {
    const suggestions = []

    if (squareData?.revenue?.trend === "up") {
      suggestions.push("How can I maintain this revenue growth?")
    }

    if (squareData?.newCustomers?.total > 50) {
      suggestions.push("What's the best way to retain new customers?")
    }

    if (instagramData?.insights?.engagement?.rate > 4) {
      suggestions.push("How can I leverage my Instagram engagement for sales?")
    }

    if (squareData?.topItems?.length > 0) {
      suggestions.push(`Should I promote ${squareData.topItems[0]?.name} more?`)
    }

    suggestions.push("What are my peak business hours?")
    suggestions.push("How can I improve my average order value?")

    return suggestions.slice(0, 4) // Return top 4 suggestions
  }
}

export default new AIChatService()
