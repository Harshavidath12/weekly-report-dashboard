import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Folder, User } from 'lucide-react';
import iconImage from '../assets/icon.png';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFormattedName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].toLowerCase();
    return `${parts[0].toLowerCase()}.${parts[1][0].toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex p-4 md:p-6 gap-6 font-sans relative overflow-hidden">
      {/* Ambient Corner Glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-300/40 to-transparent rounded-full blur-[120px] pointer-events-none -translate-x-1/4 -translate-y-1/4 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/30 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 z-0"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-orange-400/30 to-transparent rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4 z-0"></div>

      {/* Sidebar - Floating Card */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-lg shadow-slate-200/50 flex flex-col justify-between overflow-hidden shrink-0 border border-slate-100 relative z-10">
        <div>
          {/* Logo Section */}
          <div className="p-8 pb-4 flex flex-col items-center justify-center">
            <img src={iconImage} alt="Logo" className="w-20 h-20 object-contain mb-3 drop-shadow-sm" />
            <h1 className="text-xl font-bold tracking-tight text-gray-800">TeamReports</h1>
          </div>

          {/* Nav Links */}
          <nav className="px-5 mt-6 space-y-2">
            {user.role === 'Manager' && (
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-3 font-semibold text-[15px] transition-all duration-300 border-l-4 rounded-r-2xl ${isActive ? 'bg-[#f04f45] border-[#c03f37] text-white' : 'border-transparent text-slate-900 hover:bg-[#f04f45] hover:border-[#f04f45] hover:text-white'}`
                }
              >
                <LayoutDashboard size={18} /> Team Dashboard
              </NavLink>
            )}
            <NavLink
              to="/dashboard/projects"
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3 font-semibold text-[15px] transition-all duration-300 border-l-4 rounded-r-2xl ${isActive ? 'bg-[#f04f45] border-[#c03f37] text-white' : 'border-transparent text-slate-900 hover:bg-[#f04f45] hover:border-[#f04f45] hover:text-white'}`
              }
            >
              <Folder size={18} /> {user.role === 'Manager' ? 'Manage Projects' : 'Projects'}
            </NavLink>
            <NavLink
              to="/dashboard/personal"
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3 font-semibold text-[15px] transition-all duration-300 border-l-4 rounded-r-2xl ${isActive ? 'bg-[#f04f45] border-[#c03f37] text-white' : 'border-transparent text-slate-900 hover:bg-[#f04f45] hover:border-[#f04f45] hover:text-white'}`
              }
            >
              <FileText size={18} /> My Reports
            </NavLink>
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 text-gray-400 hover:text-[#f04f45] hover:bg-red-50 rounded-[1.5rem] font-semibold text-[15px] transition-colors"
          >
            Logout <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-end px-4 shrink-0">
          {/* Profile Button */}
          <div className="flex items-center gap-3 pl-5 pr-2 py-2 bg-white rounded-full border border-[#f04f45] shadow-sm cursor-pointer hover:bg-[#f04f45] transition-all duration-300 group">
            <span className="text-gray-800 font-bold text-[16px] group-hover:text-white transition-colors">{getFormattedName(user.name)}</span>
            <div className="w-9 h-9 rounded-full bg-[#f4f7fe] flex items-center justify-center overflow-hidden border border-gray-100">
              <User size={18} className="text-gray-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
