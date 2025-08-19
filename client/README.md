# Kenny's Meals Backend API

A secure Node.js/Express backend for Kenny's Meals Dashboard that handles Square POS and Instagram API integrations.

## Features

- 🔐 Secure API key management
- 📊 Square POS integration for sales data
- 📱 Instagram Insights API integration
- 🤖 AI chat functionality (OpenAI integration ready)
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📝 Request logging with Morgan
- ⚡ Fast and lightweight Express server

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment variables:**
   Copy `.env` file and update with your actual API keys:
   \`\`\`bash
   cp .env .env.local
   \`\`\`

3. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Start production server:**
   \`\`\`bash
   npm start
   \`\`\`

## API Endpoints

### Square POS
- `GET /api/square/kpis` - Dashboard KPIs
- `GET /api/square/orders` - Orders data
- `GET /api/square/menu-items` - Menu performance
- `GET /api/square/analytics/revenue` - Revenue analytics

### Instagram
- `GET /api/instagram/insights` - Instagram metrics
- `GET /api/instagram/posts/top` - Top performing posts
- `GET /api/instagram/audience` - Audience demographics

### AI Chat
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/insights` - AI-generated business insights

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

## Environment Variables

Required environment variables (see `.env` file):

- `SQUARE_ACCESS_TOKEN` - Square API access token
- `SQUARE_APPLICATION_ID` - Square application ID
- `SQUARE_LOCATION_ID` - Square location ID
- `INSTAGRAM_ACCESS_TOKEN` - Instagram API token
- `INSTAGRAM_USER_ID` - Instagram user ID
- `OPENAI_API_KEY` - OpenAI API key (for AI chat)

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets: `fly secrets set SQUARE_ACCESS_TOKEN=your_token`
5. Deploy: `fly deploy`

## Security Features

- Helmet.js for security headers
- CORS configuration for frontend access
- Rate limiting (100 requests per 15 minutes)
- Environment-based configuration
- Request logging and error handling

## Development

- Uses nodemon for auto-restart during development
- Morgan logging for request monitoring
- Comprehensive error handling
- Mock data for development/testing
