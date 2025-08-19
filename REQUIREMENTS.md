# Kenny's Meals Dashboard - Setup Requirements

## 📋 Prerequisites

Before running this program, ensure you have the following installed on your system:

### 1. **Node.js (Required)**
- **Version:** Node.js 18.0.0 or higher
- **Download:** https://nodejs.org/
- **Verify Installation:**
  ```bash
  node --version
  npm --version
  ```

### 2. **Git (Optional but Recommended)**
- **Download:** https://git-scm.com/
- **Used for:** Version control and cloning repositories

## 🚀 Installation Steps

### Step 1: Clone/Download the Project
```bash
# If using Git:
git clone <repository-url>
cd kenny-meals-dashboard/my-app

# Or download and extract the ZIP file, then navigate to my-app folder
```

### Step 2: Install Dependencies
```bash
# Install all required packages
npm install
```

This will automatically install all the dependencies listed below.

## 📦 Project Dependencies

### **Frontend Dependencies**
- **React 18.2.0** - UI framework
- **React Router DOM 6.20.1** - Navigation/routing
- **Recharts 2.15.4** - Charts and data visualization
- **Tailwind CSS 3.4.17** - Styling framework
- **Vite 4.x** - Build tool and dev server

### **Backend Dependencies**
- **Express 4.18.2** - Web server framework
- **CORS 2.8.5** - Cross-origin resource sharing
- **Helmet 7.1.0** - Security middleware
- **Morgan 1.10.0** - HTTP request logger
- **Express Rate Limit 7.1.5** - API rate limiting
- **Dotenv 16.3.1** - Environment variable management

### **Additional Libraries**
- **Axios 1.6.2** - HTTP client for API calls
- **Date-fns 2.30.0** - Date utility functions
- **Lucide React 0.294.0** - Icon library
- **HTML2Canvas 1.4.1** - Screenshot generation
- **jsPDF 2.5.1** - PDF generation
- **Square SDK 1.0.0** - Square API integration

### **Development Dependencies**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Autoprefixer** - CSS vendor prefixes
- **Nodemon** - Auto-restart server during development

## 🔧 Environment Setup

### Create Environment File (Optional)
Create a `.env` file in the project root for Square API configuration:
```env
# Square API Configuration (Optional)
SQUARE_APPLICATION_ID=your_application_id
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=your_location_id
```

## ▶️ Running the Application

### Start the Backend Server
```bash
# Option 1: Regular mode
npm run server

# Option 2: Development mode (auto-restart on changes)
npm run server:dev

# Manual alternative:
node server.js
```
- Backend will run on: **http://localhost:5000**

### Start the Frontend Development Server
```bash
# In a new terminal window/tab:
npm run dev
```
- Frontend will run on: **http://localhost:5173** (or next available port)

### Production Build
```bash
# Build for production:
npm run build

# Preview production build:
npm run preview
```

## 🔐 Default Login Credentials

- **Email:** `kenny@meals.com`
- **Password:** `dashboard123`

## 🏗️ Project Structure
```
my-app/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── components/          # React components
├── public/                  # Static assets
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── .env                    # Environment variables (optional)
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000 (backend)
   npx kill-port 5000
   
   # Kill process on port 5173 (frontend)
   npx kill-port 5173
   ```

2. **Module Not Found Errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Permission Errors (Windows)**
   - Run terminal as Administrator
   - Or use PowerShell with execution policy:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### System Requirements:
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** At least 500MB free space
- **OS:** Windows 10+, macOS 10.15+, or Linux

## 📞 Support

If you encounter issues:
1. Check that Node.js version is 18.0.0+
2. Ensure all dependencies installed successfully
3. Verify both frontend and backend servers are running
4. Check browser console for error messages

## 🎯 Quick Start Summary

```bash
# 1. Navigate to project folder
cd my-app

# 2. Install dependencies
npm install

# 3. Start backend (Terminal 1)
npm run server

# 4. Start frontend (Terminal 2)
npm run dev

# 5. Open browser to http://localhost:5173
# 6. Login with given credentials
```

---
*Last updated: August 19, 2025*
