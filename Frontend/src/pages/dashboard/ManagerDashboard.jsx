import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import reportService from '../../services/reportService';
import userService from '../../services/userService';
import projectService from '../../services/projectService';

const ManagerDashboard = () => {
  const { user } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  
  const [loading, setLoading] = useState(true);

  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [usersData, projectsData] = await Promise.all([
          userService.getAllUsers(),
          projectService.getProjects()
        ]);
        // Only show Team Members in the filter dropdown
        setUsers(usersData.filter(u => u.role === 'Team Member'));
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch dropdown data', error);
      }
    };
    if (user?.role === 'Manager') {
      fetchDropdownData();
    }
  }, [user]);

  // Fetch reports based on filters
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedUser) params.user = selectedUser;
        if (selectedProject) params.project = selectedProject;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.submissionStatus = status;

        const data = await reportService.getAllReports(params);
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Manager') {
      // Debounce slightly or just fetch immediately
      const timeoutId = setTimeout(() => {
        fetchReports();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedUser, selectedProject, startDate, endDate, status, user]);

  if (user?.role !== 'Manager') {
    return <Navigate to="/dashboard/personal" replace />;
  }

  // Calculate metrics
  const totalReports = reports.length;
  const submittedReports = reports.filter(r => r.submissionStatus === 'submitted').length;
  const complianceRate = totalReports === 0 ? 0 : Math.round((submittedReports / totalReports) * 100);
  const openBlockers = reports.filter(r => r.blockers && r.blockers.trim() !== '').length;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  // --- Chart Data Processing ---
  const trendData = useMemo(() => {
    const grouped = {};
    const dateMap = {}; // keep original dates for sorting
    reports.forEach(r => {
      const dateStr = formatDate(r.weekStartDate);
      if (!grouped[dateStr]) {
        grouped[dateStr] = 0;
        dateMap[dateStr] = new Date(r.weekStartDate);
      }
      grouped[dateStr] += (r.tasksCompleted?.length || 0);
    });
    
    return Object.keys(grouped)
      .sort((a, b) => dateMap[a] - dateMap[b])
      .map(date => ({
        name: date,
        tasks: grouped[date]
      }));
  }, [reports]);

  const workloadData = useMemo(() => {
    const grouped = {};
    reports.forEach(r => {
      const pName = r.project?.name || 'Unknown';
      if (!grouped[pName]) grouped[pName] = 0;
      grouped[pName] += (r.tasksCompleted?.length || 0);
    });
    return Object.keys(grouped).map(name => ({
      name,
      tasks: grouped[name]
    }));
  }, [reports]);

  const statusData = useMemo(() => {
    let submitted = 0;
    let pending = 0;
    reports.forEach(r => {
      if (r.submissionStatus === 'submitted') submitted++;
      else pending++;
    });
    return [
      { name: 'Submitted', value: submitted },
      { name: 'Pending', value: pending }
    ];
  }, [reports]);

  const COLORS = ['#f97316', '#0f172a', '#94a3b8', '#cbd5e1'];

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white p-6 shadow-sm border border-[#f04f45] border-l-4 border-l-orange-600 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Team Dashboard</h2>
        <p className="text-slate-500">
          Overview of all team members' reports and submission statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f04f45] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Team Member</label>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="">All Members</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="draft">Pending (Draft)</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all duration-300 ease-out">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reports Found</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? '--' : totalReports}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all duration-300 ease-out">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{loading ? '--%' : `${complianceRate}%`}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all duration-300 ease-out">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Blockers</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? '--' : openBlockers}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Tasks Completed Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="tasks" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Workload Distribution by Project</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="tasks" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#f04f45] shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Submission Status</h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f04f45] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity Feed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Week Period</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Blockers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No reports found matching your filters.</td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{report.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{report.user?.email}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{report.project?.name || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-700 whitespace-nowrap">
                      {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.submissionStatus === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {report.submissionStatus === 'submitted' ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700 max-w-xs truncate">
                      {report.blockers ? (
                        <span className="text-red-600 font-medium">{report.blockers}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
