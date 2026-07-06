import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans"
      style={{ background: 'radial-gradient(circle at top, #15294d 0%, #0b1120 40%, #050816 100%)' }}
    >
      <div className="sm:mx-auto sm:w-full max-w-[480px]">
        <div className="flex justify-center mb-10">
          {/* Faux logo matching the reference style */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#FFFFFF] tracking-tight">
              Weekly Report
            </h2>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full max-w-[480px]">
        <div 
          className="py-10 px-6 sm:rounded-2xl sm:px-10"
          style={{ 
            backgroundColor: '#151F33', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 40px rgba(0,0,0,.45), 0 0 50px rgba(59,130,246,.08)'
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
