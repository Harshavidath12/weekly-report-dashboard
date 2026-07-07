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
    <div className="min-h-screen bg-[#fcfaf9] flex p-4 md:p-6 gap-6 font-sans">
      {/* Sidebar - Floating Card */}
      <aside className="w-64 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between overflow-hidden shrink-0 border border-gray-100">
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
                  `flex items-center gap-4 px-6 py-3.5 rounded-[1.5rem] font-semibold text-[15px] transition-all duration-300 ${isActive ? 'bg-[#f04f45] text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
                }
              >
                <LayoutDashboard size={18} /> Team Dashboard
              </NavLink>
            )}
            <NavLink 
              to="/dashboard/projects" 
              className={({ isActive }) => 
                `flex items-center gap-4 px-6 py-3.5 rounded-[1.5rem] font-semibold text-[15px] transition-all duration-300 ${isActive ? 'bg-[#f04f45] text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
              }
            >
              <Folder size={18} /> {user.role === 'Manager' ? 'Manage Projects' : 'Projects'}
            </NavLink>
            <NavLink 
              to="/dashboard/personal" 
              className={({ isActive }) => 
                `flex items-center gap-4 px-6 py-3.5 rounded-[1.5rem] font-semibold text-[15px] transition-all duration-300 ${isActive ? 'bg-[#f04f45] text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-end px-4 shrink-0">
          {/* Profile Button */}
          <div className="flex items-center gap-3 pl-5 pr-2 py-2 bg-white rounded-full border border-[#f04f45] shadow-sm cursor-default">
            <span className="text-gray-800 font-semibold text-[14px]">{getFormattedName(user.name)}</span>
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
