import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'Manager') {
    return <Navigate to="/dashboard/personal" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm border border-slate-100 border-l-4 border-l-orange-600 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Team Dashboard</h2>
        <p className="text-slate-500">
          Overview of all team members' reports and submission statuses.
        </p>
        <p className="mt-4 text-sm text-slate-400 italic">
          [Placeholder for the Core Requirement #3 & #5: Team Dashboard & Visual Insights]
        </p>
      </div>
      
      {/* Sample Metrics Cards UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-colors hover:border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reports Submitted</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-colors hover:border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compliance Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">--%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-colors hover:border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Blockers</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
