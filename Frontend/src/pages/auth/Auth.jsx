import { useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import bgImage from '../../assets/small.png';

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, login, register: registerUser } = useAuth();

  // Get action from URL, default to login
  const action = searchParams.get('action') || 'login';
  const isLogin = action === 'login';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Team Member');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const criteria = [
    { label: 'Min. 6 characters', met: password.length >= 6 },
    { label: '1 Uppercase & 1 Lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: '1 Number', met: /[0-9]/.test(password) },
    { label: '1 Special character (@, #, etc.)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const validatePassword = () => criteria.every(c => c.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (!isLogin && !validatePassword()) {
      setPasswordError('Please ensure all password requirements are met.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await registerUser(name, email, password, role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAction = (newAction) => {
    setError('');
    setPasswordError('');
    setSearchParams({ action: newAction });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">Loading...</div>;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
      {/* Left Branding Panel */}
      <div className="hidden md:flex relative overflow-hidden bg-gradient-to-r from-white to-slate-50 h-full w-full items-center justify-center">
        {/* Ambient Purple Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-300/20 w-[400px] h-[400px] rounded-full blur-[120px] mix-blend-multiply pointer-events-none z-0"></div>

        <img
          src={bgImage}
          alt="Branding"
          className="relative z-10 w-full h-full object-contain object-center p-8 drop-shadow-sm"
        />
      </div>

      {/* Right Form Container */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 relative z-10 w-full h-full">
        <div className="w-full max-w-[560px] bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-12 border border-gray-50/50">

          {/* Header Text */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Hello There Wanderer!</h1>
            <h2 className="text-xl font-bold text-gray-800">
              Welcome to <span className="text-[#f04f45]">Weekly Report</span>
            </h2>
            <p className="text-[13px] text-gray-400 mt-2 px-4 leading-relaxed">
              {isLogin
                ? "Please complete the login process with correct information"
                : "Please complete the registration process with correct information"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100/80 rounded-full p-1 inline-flex shadow-inner">
              <button
                type="button"
                onClick={() => toggleAction('login')}
                className={`px-8 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${isLogin
                  ? 'bg-[#f04f45] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => toggleAction('register')}
                className={`px-8 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${!isLogin
                  ? 'bg-[#f04f45] text-white shadow-md shadow-red-500/20'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Register
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {!isLogin && (
              <div className="relative">
                <label className="absolute -top-2 left-4 px-1.5 bg-white text-[11px] font-medium text-gray-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className="block w-full bg-white border border-gray-200/80 rounded-[1.5rem] px-5 py-4 text-gray-800 text-[15px] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 hover:border-gray-300 transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <label className="absolute -top-2 left-4 px-1.5 bg-white text-[11px] font-medium text-gray-400">
                Email address *
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                placeholder="harshithavidath@gmail.com"
                className={`block w-full bg-[#f4f7fe]/50 border border-gray-200/80 rounded-[1.5rem] px-5 py-4 text-gray-800 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 hover:border-gray-300 transition-all shadow-sm ${email ? 'bg-blue-50/30' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-4 px-1.5 bg-white text-[11px] font-medium text-gray-400">
                Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                className="block w-full bg-white border border-gray-200/80 rounded-[1.5rem] px-5 py-4 pr-12 text-gray-800 text-[15px] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 hover:border-gray-300 transition-all shadow-sm tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {!isLogin && (
                <div className="mt-3 px-3 space-y-1.5">
                  {criteria.map((c, i) => (
                    <div key={i} className={`text-[11px] flex items-center transition-colors duration-300 ${c.met ? 'text-green-500' : 'text-gray-400'}`}>
                      {c.met ? <CheckCircle2 size={12} className="mr-1.5" /> : <Circle size={12} className="mr-1.5" />}
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
              {!isLogin && passwordError && <p className="mt-2 text-xs text-red-500 px-3">{passwordError}</p>}
            </div>

            {!isLogin && (
              <div className="relative">
                <label className="absolute -top-2 left-4 px-1.5 bg-white text-[11px] font-medium text-gray-400 z-10">
                  Role *
                </label>
                <select
                  className="block w-full bg-white border border-gray-200/80 rounded-[1.5rem] px-5 py-4 text-gray-800 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 hover:border-gray-300 transition-all shadow-sm appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Manager">Manager</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 mt-8 rounded-[1.5rem] text-[16px] font-bold text-white bg-[#f04f45] hover:bg-[#d9453c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f04f45] disabled:opacity-50 transition-all duration-200 shadow-[0_8px_20px_rgba(240,79,69,0.3)] hover:shadow-[0_10px_25px_rgba(240,79,69,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Login' : 'Register Now')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
