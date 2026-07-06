import { useAuth } from '../../context/AuthContext';

const PersonalReport = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">My Weekly Reports</h2>
        <p className="text-slate-600">
          Welcome, {user.name}. You are logged in as a {user.role}.
        </p>
        <p className="mt-4 text-sm text-slate-500 italic">
          [Placeholder for the Core Requirement #2: Personal Weekly Report Page]
        </p>
      </div>
    </div>
  );
};

export default PersonalReport;
