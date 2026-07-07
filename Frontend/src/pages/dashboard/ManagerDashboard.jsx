import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import reportService from '../../services/reportService';
import userService from '../../services/userService';
import projectService from '../../services/projectService';
import { ChevronDown, LayoutDashboard, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600, color: '#0F172A' }} />
                <Line type="monotone" dataKey="tasks" stroke="#FF6B35" strokeWidth={3} dot={{r: 4, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6, strokeWidth: 0, fill: '#FF6B35', stroke: '#FF6B35', strokeOpacity: 0.2, strokeWidth: 10}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Bar Chart */}
        <div className="bg-white p-8 rounded-[20px] border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-8">Workload Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} dx={-10} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600, color: '#0F172A' }} />
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
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600 }} itemStyle={{color: '#0F172A'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '13px', fontWeight: 500, color: '#64748B'}} />
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Week Period</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blockers</th>
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
                reports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:border-[#FF6B35] group-hover:text-[#FF6B35] transition-colors">
                          {getInitials(report.user?.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-slate-900">{report.user?.name || 'Unknown'}</div>
                          <div className="text-[13px] text-slate-500 font-medium">{report.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-medium text-slate-700">{report.project?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-[14px] font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(report.weekStartDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(report.weekEndDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-bold tracking-wide ${report.submissionStatus === 'submitted' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20'}`}>
                        {report.submissionStatus === 'submitted' ? 'SUBMITTED' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-[14px] text-slate-700 max-w-[250px] truncate">
                      {report.blockers ? (
                        <span className="text-red-500 font-medium flex items-center gap-1.5" title={report.blockers}>
                          <AlertCircle size={14} /> {report.blockers}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
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
