import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUsernameError('');
    setLoading(true);

    try {
      if (!username) {
        throw new Error('Username is required');
      }
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      // Show username-specific errors under the username field
      if (errorMessage.includes('Username already taken') || errorMessage.includes('username')) {
        setUsernameError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lol-dark via-gray-900 to-lol-dark p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-lol-gold via-yellow-400 to-lol-gold bg-clip-text text-transparent">
            LEAGUE CARDS
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-lol-gray p-8 rounded-xl border-2 border-lol-gold shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError(''); // Clear error when typing
                  }}
                  placeholder="Enter your username"
                  className={`w-full px-4 py-3 bg-lol-dark text-white border-2 rounded-lg focus:outline-none transition-all ${
                    usernameError
                      ? 'border-red-500 focus:border-red-500 shake'
                      : 'border-gray-700 focus:border-lol-gold'
                  }`}
                  required
                  minLength={3}
                  maxLength={20}
                />
                {usernameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <span className="text-red-500 text-xl">⚠️</span>
                  </motion.div>
                )}
              </div>
              {usernameError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2"
                >
                  <span className="text-red-400 text-sm">❌</span>
                  <p className="text-red-300 text-sm font-medium">{usernameError}</p>
                </motion.div>
              )}
              {!isLogin && !usernameError && (
                <p className="mt-2 text-xs text-gray-400">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-lol-dark text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-lol-gold transition-colors"
                required
                minLength={8}
              />
              {!isLogin && (
                <div className="mt-2 p-3 bg-gray-800 rounded-lg text-xs">
                  <div className="text-gray-400 mb-1 font-medium">Password must contain:</div>
                  <ul className="space-y-1 text-gray-500">
                    <li className={password.length >= 8 ? 'text-green-400' : ''}>
                      ✓ At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                      ✓ One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
                      ✓ One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                      ✓ One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-3 text-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-lol-blue hover:text-lol-gold transition-colors"
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-lol-gray/50 rounded-lg border border-gray-700"
        >
          <p className="text-sm text-gray-400 text-center">
            🎮 Create an account to save your progress across all devices
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
