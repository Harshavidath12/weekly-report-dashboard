import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import reportService from '../../services/reportService';
import userService from '../../services/userService';
import projectService from '../../services/projectService';
import { ChevronDown, LayoutDashboard, Filter, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

const CustomDropdown = ({ value, onChange, options, defaultLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : defaultLabel;

  return (
    <div className="relative min-w-[140px]" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 bg-white border ${value ? 'border-[#FF6B35]' : 'border-slate-200'} rounded-full text-[13px] font-medium text-slate-700 hover:border-[#FF6B35] transition-all flex justify-between items-center cursor-pointer shadow-sm`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(!isOpen); }}
      >
        <span className="truncate mr-2">{displayLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden py-1 max-h-60 overflow-y-auto">
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors ${value === '' ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {defaultLabel}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={20} textAnchor="middle" fill="#94A3B8" fontSize={11} fontWeight={500}>
        {words.map((word, index) => (
          <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

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

  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);

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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- Chart Data Processing ---
  const trendData = useMemo(() => {
    const grouped = {};
    const dateMap = {};
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

  const COLORS = ['#FF6B35', '#0F172A', '#94A3B8', '#CBD5E1'];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-[#FF6B35]" size={28} />
            Team Overview
          </h2>
          <p className="text-slate-500 mt-2 font-medium text-[15px]">
            Monitor team progress, workload distribution, and weekly reports.
          </p>
        </div>

        {/* Inline Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-sm font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            <Filter size={14} className="mr-1.5" /> Filters
          </div>
          <CustomDropdown
            value={selectedUser}
            onChange={setSelectedUser}
            options={users.map(u => ({ value: u._id, label: u.name }))}
            defaultLabel="All Members"
          />
          <CustomDropdown
            value={selectedProject}
            onChange={setSelectedProject}
            options={projects.map(p => ({ value: p._id, label: p.name }))}
            defaultLabel="All Projects"
          />
          <CustomDropdown
            value={status}
            onChange={setStatus}
            options={[
              { value: 'submitted', label: 'Submitted' },
              { value: 'draft', label: 'Pending (Draft)' }
            ]}
            defaultLabel="All Statuses"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex items-start justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Reports</h3>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{loading ? '--' : totalReports}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF6B35]/10 transition-colors">
            <FileText className="text-slate-400 group-hover:text-[#FF6B35] transition-colors" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex items-start justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-1">Compliance Rate</h3>
            <p className="text-4xl font-bold text-[#FF6B35] tracking-tight">{loading ? '--%' : `${complianceRate}%`}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF6B35]/10 transition-colors">
            <CheckCircle2 className="text-slate-400 group-hover:text-[#FF6B35] transition-colors" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex items-start justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 mb-1">Open Blockers</h3>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{loading ? '--' : openBlockers}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <AlertCircle className="text-slate-400 group-hover:text-red-500 transition-colors" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-[20px] border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-slate-900">Task Velocity Trend</h3>
            <div className="flex items-center gap-3">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-[#FF6B35] transition-colors" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600, color: '#0F172A' }} />
                <Line type="monotone" dataKey="tasks" stroke="#FF6B35" strokeWidth={3} dot={{ r: 4, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#FF6B35', stroke: '#FF6B35', strokeOpacity: 0.2, strokeWidth: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Bar Chart */}
        <div className="bg-white p-8 rounded-[20px] border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-8">Workload Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600, color: '#0F172A' }} />
                <Bar dataKey="tasks" fill="#0F172A" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-white p-8 rounded-[20px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-2">Submission Status</h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600 }} itemStyle={{ color: '#0F172A' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity Feed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[25%]">Member</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[20%]">Project</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[20%]">Week Period</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[12%]">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[23%]">Blockers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">No reports found matching your filters.</td>
                </tr>
              ) : (
                reports.slice(0, 4).map(report => (
                  <tr key={report._id} className="hover:bg-slate-50 transition-colors duration-200 group even:bg-slate-50/30">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-600 group-hover:border-[#FF6B35] group-hover:text-[#FF6B35] transition-colors duration-200 shrink-0">
                          {getInitials(report.user?.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[14px] text-slate-900 truncate">{report.user?.name || 'Unknown'}</div>
                          <div className="text-[12px] text-slate-400 font-normal truncate">{report.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[14px] font-medium text-slate-700 truncate">{report.project?.name || 'N/A'}</td>
                    <td className="px-6 py-5 text-[13px] font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(report.weekStartDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(report.weekEndDate)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${report.submissionStatus === 'submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {report.submissionStatus === 'submitted' ? 'SUBMITTED' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[14px]">
                      {report.blockers ? (
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200" title="Needs Attention">
                            <AlertCircle size={12} />
                          </span>
                          <span
                            className="text-slate-600 truncate max-w-[150px] xl:max-w-[200px]"
                            title={report.blockers}
                          >
                            {report.blockers.length > 50 ? report.blockers.substring(0, 50) + '...' : report.blockers}
                          </span>
                          {report.blockers.length > 50 && (
                            <button
                              onClick={() => {
                                setSelectedBlocker({ text: report.blockers, user: report.user?.name });
                                setIsBlockerModalOpen(true);
                              }}
                              className="shrink-0 text-[#FF6B35] text-[12px] font-semibold hover:underline ml-1"
                            >
                              View
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[13px]">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocker Modal */}
      {isBlockerModalOpen && selectedBlocker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={20} />
                Blocker Details
              </h3>
              <button
                onClick={() => setIsBlockerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-100 p-1.5 rounded-full shadow-sm border border-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-3">Reported by <span className="font-semibold text-slate-700">{selectedBlocker.user || 'Unknown'}</span></p>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                {selectedBlocker.text}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsBlockerModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
