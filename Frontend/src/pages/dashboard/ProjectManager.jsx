import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Folder, X, Loader2, Users, Check } from 'lucide-react';
import projectService from '../../services/projectService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const ProjectManager = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    assignedMembers: []
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        projectService.getProjects(),
        user?.role === 'Manager' ? userService.getAllUsers() : Promise.resolve([])
      ]);
      setProjects(projectsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ 
        name: project.name || '', 
        description: project.description || '',
        status: project.status || 'Active',
        priority: project.priority || 'Medium',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        assignedMembers: project.assignedMembers || [] 
      });
    } else {
      setEditingProject(null);
      setFormData({ 
        name: '', 
        description: '', 
        status: 'Active',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        assignedMembers: [] 
      });
    }
    setMemberSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'Active', priority: 'Medium', startDate: '', endDate: '', assignedMembers: [] });
    setMemberSearch('');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleUserAssignment = (userId) => {
    setFormData(prev => {
      const isAssigned = prev.assignedMembers.includes(userId);
      return {
        ...prev,
        assignedMembers: isAssigned 
          ? prev.assignedMembers.filter(id => id !== userId)
          : [...prev.assignedMembers, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingProject) {
        await projectService.updateProject(editingProject._id, formData);
      } else {
        await projectService.createProject(formData);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(id);
      await fetchData();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleJoin = async (id) => {
    try {
      await projectService.joinProject(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join project');
    }
  };

  const handleLeave = async (id) => {
    try {
      await projectService.leaveProject(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave project');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {user?.role === 'Manager' ? 'Project Management' : 'Available Projects'}
          </h2>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Manager' 
              ? 'Manage projects and assign team members.' 
              : 'Browse active projects and join them to start reporting.'}
          </p>
        </div>
        {user?.role === 'Manager' && (
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#3B82F6] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all font-medium"
          >
            <Plus size={18} className="mr-2" /> Add Project
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-[#3B82F6]" size={32} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
              <Folder size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects available</h3>
              <p className="text-slate-500 mb-6">There are currently no active projects.</p>
            </div>
          ) : (
            projects.map((project) => {
              const isAssigned = project.assignedMembers?.includes(user._id);

              return (
                <div key={project._id} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between ${isAssigned ? 'border-l-4 border-l-orange-500' : ''}`}>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 text-lg flex flex-wrap items-center gap-2 max-w-full">
                        <Folder size={16} className="text-orange-500 shrink-0" />
                        <span className="break-words">{project.name}</span>
                        {project.priority && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            project.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                            project.priority === 'Low' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {project.priority}
                          </span>
                        )}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {project.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border whitespace-nowrap ${
                            project.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {project.status}
                          </span>
                        )}
                        {user?.role !== 'Manager' && isAssigned && (
                          <span className="bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full border border-green-200 flex items-center whitespace-nowrap">
                            <Check size={12} className="mr-1" /> Joined
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mt-2">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="mt-3 flex items-center text-slate-500 text-sm">
                      <Users size={14} className="mr-1.5" />
                      {project.assignedMembers?.length || 0} members
                    </div>
                    {(project.startDate || project.endDate) && (
                      <span className="text-xs text-slate-400 font-medium tracking-wide mt-2 block">
                        Duration: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                    {user?.role === 'Manager' ? (
                      <>
                        <button
                          onClick={() => openModal(project)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      isAssigned ? (
                        <button
                          onClick={() => handleLeave(project._id)}
                          className="border border-red-200 text-red-600 font-medium py-2 px-4 rounded-xl hover:bg-red-50 transition-colors w-full"
                        >
                          Leave Project
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(project._id)}
                          className="bg-orange-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-orange-700 transition-colors w-full"
                        >
                          Join Project
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal for Managers */}
      {isModalOpen && user?.role === 'Manager' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white">
              <h3 className="text-xl font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-0 space-y-0 flex flex-col h-full">
              
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Q3 Marketing Campaign"
                    className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px]"
                  />
                </div>

                {/* Status & Priority Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px]"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority Level</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px]"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Provide a brief overview of the project's goals."
                    className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 hover:border-slate-300 transition-all shadow-sm text-[15px] resize-y"
                  />
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Team Members</label>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                      <input
                        type="text"
                        placeholder="Search members by name..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-[14px] text-slate-700 placeholder-slate-400"
                      />
                    </div>
                    
                    <div className="max-h-[220px] overflow-y-auto p-2">
                      {users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 ? (
                        <div className="text-[14px] text-slate-400 p-4 text-center">No users found.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map(u => (
                            <label key={u._id} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${formData.assignedMembers.includes(u._id) ? 'bg-[#FF6B35]/5 border-[#FF6B35]/30' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                              <input 
                                type="checkbox" 
                                checked={formData.assignedMembers.includes(u._id)}
                                onChange={() => toggleUserAssignment(u._id)}
                                className="w-4 h-4 rounded border-slate-300 text-[#FF6B35] focus:ring-[#FF6B35] mr-3"
                              />
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 mr-3 shrink-0">
                                {getInitials(u.name)}
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[14px] font-semibold text-slate-900 truncate">{u.name}</span>
                                <span className="block text-[12px] text-slate-500 truncate">{u.role}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-400 mt-2">Select the team members who will have access to this project.</p>
                </div>
              </div>

              <div className="px-8 py-5 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all font-semibold shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-xl hover:bg-[#E55A2B] shadow-sm transition-all disabled:opacity-50 font-semibold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center"
                >
                  {isSaving ? (
                    <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</>
                  ) : (
                    'Save Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
