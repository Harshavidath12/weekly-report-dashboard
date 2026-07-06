import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-[#FFFFFF] mb-8 text-center">Sign in to your account</h3>
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8]">Email address</label>
          <input
            type="email"
            required
            autoComplete="off"
            className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] sm:text-sm transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 pl-4 pr-10 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] sm:text-sm transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white mt-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 mt-6 border border-transparent rounded-lg text-sm font-bold text-[#FFFFFF] bg-[#2563EB] hover:bg-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#151F33] focus:ring-[#3B82F6] disabled:opacity-50 transition-all duration-200"
          style={{ boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="mt-8 text-center text-sm">
        <span className="text-[#94A3B8]">Don't have an account? </span>
        <Link to="/register" className="font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
