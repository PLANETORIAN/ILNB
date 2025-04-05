import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      // Handle Firebase auth errors
      switch(error.code) {
        case 'auth/email-already-in-use':
          setError('Email is already in use');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/operation-not-allowed':
          setError('Account creation is disabled');
          break;
        case 'auth/configuration-not-found':
          setError('Firebase configuration error. Please contact support.');
          break;
        default:
          setError('Failed to create an account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-effect p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl animate-float" style={{ animationDelay: '0ms' }} />
            <div className="w-12 h-12 bg-purple-600 rounded-2xl -ml-4 animate-float" style={{ animationDelay: '200ms' }} />
            <div className="w-12 h-12 bg-purple-700 rounded-2xl -ml-4 animate-float" style={{ animationDelay: '400ms' }} />
          </div>
          <h1 className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Create Account
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Create a password"
              required
            />
            <p className="text-xs mt-1 text-gray-500">Must be at least 6 characters long</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full button-animate bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup; 