import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold">TeamReports</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {user.role === 'Manager' && (
            <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
              <LayoutDashboard size={20} /> Team Dashboard
            </Link>
          )}
          <Link to="/dashboard/personal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <FileText size={20} /> My Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="mb-4">
            <p className="text-sm text-slate-400">Logged in as:</p>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {user.role === 'Manager' ? 'Manager Overview' : 'Team Member Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
