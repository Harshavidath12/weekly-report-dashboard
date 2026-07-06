import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Folder } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B1120] text-[#F8FAFC] flex flex-col border-r border-[#334155]">
        <div className="p-4 flex items-center gap-3 border-b border-[#334155]">
          <div className="w-8 h-8 bg-[#3B82F6] rounded flex items-center justify-center shadow-lg shadow-blue-500/40">
            <span className="text-white font-bold">W</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">TeamReports</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {user.role === 'Manager' && (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1E293B] transition-colors">
                <LayoutDashboard size={20} className="text-[#94A3B8]" /> Team Dashboard
              </Link>
              <Link to="/dashboard/projects" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1E293B] transition-colors">
                <Folder size={20} className="text-[#94A3B8]" /> Manage Projects
              </Link>
            </>
          )}
          <Link to="/dashboard/personal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1E293B] transition-colors">
            <FileText size={20} className="text-[#94A3B8]" /> My Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-[#334155]">
          <div className="mb-4">
            <p className="text-sm text-[#94A3B8]">Logged in as:</p>
            <p className="font-semibold text-[#F8FAFC]">{user.name}</p>
            <p className="text-xs text-[#3B82F6] capitalize font-medium">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#111827] shadow-sm border-b border-[#334155] h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-[#F8FAFC]">
            {user.role === 'Manager' ? 'Manager Overview' : 'Team Member Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0F172A] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
