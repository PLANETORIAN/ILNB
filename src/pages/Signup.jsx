import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const { signup, signInWithGoogle } = useAuth();
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
      await signup(name, email, password, age, location);
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
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
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your age"
              required
              min="18"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Enter your city or region"
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
          
          <div className="relative my-4 flex items-center justify-center">
            <div className="flex-grow border-t border-white/20"></div>
            <div className="mx-4 text-white/60 text-sm">OR</div>
            <div className="flex-grow border-t border-white/20"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-all"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Sign up with Google
              </>
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