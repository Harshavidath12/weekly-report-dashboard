import { useAuth } from '../../context/AuthContext';

const PersonalReport = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155]">
        <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">My Weekly Reports</h2>
        <p className="text-[#94A3B8]">
          Welcome, <span className="text-white font-medium">{user.name}</span>. You are logged in as a <span className="text-[#3B82F6] font-medium">{user.role}</span>.
        </p>
        <p className="mt-4 text-sm text-[#3B82F6] italic">
          [Placeholder for the Core Requirement #2: Personal Weekly Report Page]
        </p>
      </div>
    </div>
  );
};

export default PersonalReport;
