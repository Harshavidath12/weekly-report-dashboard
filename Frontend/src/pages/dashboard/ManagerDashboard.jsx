import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'Manager') {
    return <Navigate to="/dashboard/personal" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Team Dashboard</h2>
        <p className="text-slate-600">
          Overview of all team members' reports and submission statuses.
        </p>
        <p className="mt-4 text-sm text-slate-500 italic">
          [Placeholder for the Core Requirement #3 & #5: Team Dashboard & Visual Insights]
        </p>
      </div>
      
      {/* Sample Metrics Cards UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Reports Submitted</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Compliance Rate</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">--%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Open Blockers</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">--</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
