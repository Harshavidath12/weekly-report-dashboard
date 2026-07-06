import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 6;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long and include an uppercase letter, lowercase letter, number, and a special character.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-[#FFFFFF] mb-8 text-center">Create a new account</h3>
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8]">Full Name</label>
          <input
            type="text"
            required
            autoComplete="off"
            className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] sm:text-sm transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          {passwordError && <p className="mt-2 text-sm text-red-400">{passwordError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8]">Role</label>
          <select
            className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] sm:text-sm transition-colors"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Team Member">Team Member</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 mt-16 border border-transparent rounded-lg text-sm font-bold text-[#FFFFFF] bg-[#2563EB] hover:bg-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#151F33] focus:ring-[#3B82F6] disabled:opacity-50 transition-all duration-200"
          style={{ boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <div className="mt-8 text-center text-sm">
        <span className="text-[#94A3B8]">Already have an account? </span>
        <Link to="/login" className="font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
