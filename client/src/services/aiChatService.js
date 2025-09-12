class AIChatService {
  constructor() {
    this.backendURL = "http://localhost:5001/api" // Backend API URL
  }

  async sendMessage(message, context = {}) {
    try {
      // Call backend API instead of mock responses
      const response = await fetch(`${this.backendURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          success: true,
          message: data.data.response,
          timestamp: data.data.timestamp
        }
      } else {
        throw new Error(data.error)
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

    return suggestions.slice(0, 4)
  }
}

export default new AIChatService()
