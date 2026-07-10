import { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Folder, User, Menu, ChevronLeft } from 'lucide-react';
import iconImage from '../assets/icon.png';
import AIChatAssistant from '../components/AIChatAssistant';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Loading...</div>;

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
    <div className="h-screen bg-[#F8FAFC] flex p-4 md:p-6 gap-6 font-sans relative overflow-hidden">
      {/* Ambient Corner Glows - slightly toned down */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-[120px] pointer-events-none -translate-x-1/4 -translate-y-1/4 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-300/20 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 z-0"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-orange-300/20 to-transparent rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4 z-0"></div>

      {/* Sidebar - Floating Card */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-sm flex flex-col justify-between overflow-hidden shrink-0 border border-slate-100 relative z-10`}
      >
        <div>
          {/* Logo Section */}
          <div className={`p-8 pb-4 flex flex-col items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
            <img src={iconImage} alt="Logo" className="w-16 h-16 object-contain mb-3 drop-shadow-sm" />
            <h1 className="text-lg font-bold tracking-tight text-slate-800">TeamReports</h1>
          </div>
          
          {/* Collapsed Logo */}
          <div className={`pt-8 pb-4 flex flex-col items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
            <img src={iconImage} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>

          {/* Nav Links */}
          <nav className={`mt-6 space-y-2 ${isSidebarCollapsed ? 'px-3' : 'px-5'}`}>
            {user.role === 'Manager' && (
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center ${isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 px-5 py-3 border-l-4 rounded-r-2xl'} font-semibold text-[15px] transition-all duration-300 ${isActive ? (isSidebarCollapsed ? 'bg-[#FF6B35] text-white shadow-sm' : 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]') : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                }
                title={isSidebarCollapsed ? "Team Dashboard" : ""}
              >
                <LayoutDashboard size={18} />
                {!isSidebarCollapsed && <span>Team Dashboard</span>}
              </NavLink>
            )}
            <NavLink
              to="/dashboard/projects"
              className={({ isActive }) =>
                `flex items-center ${isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 px-5 py-3 border-l-4 rounded-r-2xl'} font-semibold text-[15px] transition-all duration-300 ${isActive ? (isSidebarCollapsed ? 'bg-[#FF6B35] text-white shadow-sm' : 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]') : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
              title={isSidebarCollapsed ? (user.role === 'Manager' ? 'Manage Projects' : 'Projects') : ""}
            >
              <Folder size={18} />
              {!isSidebarCollapsed && <span>{user.role === 'Manager' ? 'Manage Projects' : 'Projects'}</span>}
            </NavLink>
            <NavLink
              to="/dashboard/personal"
              className={({ isActive }) =>
                `flex items-center ${isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 px-5 py-3 border-l-4 rounded-r-2xl'} font-semibold text-[15px] transition-all duration-300 ${isActive ? (isSidebarCollapsed ? 'bg-[#FF6B35] text-white shadow-sm' : 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]') : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
              title={isSidebarCollapsed ? (user?.role === 'Manager' ? 'Team Reports' : 'My Reports') : ""}
            >
              <FileText size={18} />
              {!isSidebarCollapsed && <span>{user?.role === 'Manager' ? 'Team Reports' : 'My Reports'}</span>}
            </NavLink>
          </nav>
        </div>

        <div className={`p-6 ${isSidebarCollapsed ? 'px-3' : ''}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[1.5rem] font-semibold text-[15px] transition-colors`}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            {isSidebarCollapsed ? <LogOut size={18} /> : (
              <>Logout <LogOut size={16} /></>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              title="Toggle Sidebar"
            >
              {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Profile Button */}
          <div className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm cursor-pointer hover:border-[#FF6B35] hover:shadow-md transition-all duration-300 group">
            <div className="flex flex-col items-start pl-2">
              <span className="text-slate-700 font-bold text-[15px] leading-tight group-hover:text-slate-900 transition-colors">{getFormattedName(user.name)}</span>
              <span className="text-slate-500 text-[11px] font-medium mt-0.5">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35] transition-colors">
              <User size={18} className="text-slate-500 group-hover:text-[#FF6B35] transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8 pr-2">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Assistant - Only visible to Managers */}
      {user?.role === 'Manager' && <AIChatAssistant />}
    </div>
  );
};

export default DashboardLayout;
