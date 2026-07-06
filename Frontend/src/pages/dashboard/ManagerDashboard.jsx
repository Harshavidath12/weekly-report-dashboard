import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'Manager') {
    return <Navigate to="/dashboard/personal" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155]">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Team Dashboard</h2>
        <p className="text-[#94A3B8]">
          Overview of all team members' reports and submission statuses.
        </p>
        <p className="mt-4 text-sm text-[#3B82F6] italic">
          [Placeholder for the Core Requirement #3 & #5: Team Dashboard & Visual Insights]
        </p>
      </div>
      
      {/* Sample Metrics Cards UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155] hover:border-[#3B82F6]/50 transition-colors">
          <h3 className="text-sm font-medium text-[#94A3B8]">Reports Submitted</h3>
          <p className="text-3xl font-bold text-[#F8FAFC] mt-2">--</p>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155] hover:border-[#3B82F6]/50 transition-colors">
          <h3 className="text-sm font-medium text-[#94A3B8]">Compliance Rate</h3>
          <p className="text-3xl font-bold text-[#3B82F6] mt-2">--%</p>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155] hover:border-[#3B82F6]/50 transition-colors">
          <h3 className="text-sm font-medium text-[#94A3B8]">Open Blockers</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">--</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
