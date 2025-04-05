import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Import Firebase configuration first
import './firebase.config.js'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { PortfolioProvider } from './context/PortfolioContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PortfolioProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)