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
    assignedMembers: []
  });
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
        name: project.name, 
        description: project.description,
        assignedMembers: project.assignedMembers || [] 
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', assignedMembers: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', assignedMembers: [] });
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
                    <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center justify-between">
                      <span className="flex items-center">
                        <Folder size={16} className="mr-2 text-orange-500" />
                        {project.name}
                      </span>
                      {user?.role !== 'Manager' && isAssigned && (
                        <span className="bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full border border-green-200 flex items-center">
                          <Check size={12} className="mr-1" /> Joined
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mt-2">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="mt-3 flex items-center text-slate-500 text-sm">
                      <Users size={14} className="mr-1.5" />
                      {project.assignedMembers?.length || 0} members
                    </div>
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
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#334155]">
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button onClick={closeModal} className="text-[#94A3B8] hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Assign Team Members</label>
                <div className="bg-[#0D1626] border border-white/5 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                  {users.length === 0 ? (
                    <div className="text-sm text-[#94A3B8] p-2">No users found.</div>
                  ) : (
                    users.map(u => (
                      <label key={u._id} className="flex items-center p-2 hover:bg-[#1E293B] rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.assignedMembers.includes(u._id)}
                          onChange={() => toggleUserAssignment(u._id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-gray-800"
                        />
                        <div className="ml-3">
                          <span className="block text-sm text-[#F8FAFC]">{u.name}</span>
                          <span className="block text-xs text-[#94A3B8]">{u.role}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#334155] mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-[#94A3B8] hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#3B82F6] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all disabled:opacity-50 font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save Project'}
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
