import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Dashboard from './pages/Dashboard'
import Compare from './pages/Compare'
import Execute from './pages/Execute'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import Reports from './pages/Reports'

function App() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  
  // Check if current path is landing page
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Background blur and shimmer effects - only for non-landing pages */}
      {!isLandingPage && (
        <div className="fixed inset-0" style={{zIndex: -1}}>
          {/* Base blur layer */}
          <div className="bg-blur absolute inset-0"></div>
          
          {/* Colored blur circles */}
          <div className="bg-blur-elements absolute inset-0">
            <div className="blur-circle"></div>
            <div className="blur-circle"></div>
            <div className="blur-circle"></div>
          </div>
          
          {/* Shimmer overlay */}
          <div className="shimmer-effect absolute inset-0"></div>
        </div>
      )}
      
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-6 relative z-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/compare" element={user ? <Compare /> : <Navigate to="/login" />} />
          <Route path="/execute" element={user ? <Execute /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App