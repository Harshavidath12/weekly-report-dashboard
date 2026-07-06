import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Folder, X, Loader2 } from 'lucide-react';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

const ProjectManager = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await fetchProjects();
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
      await fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (user?.role !== 'Manager') {
    return (
      <div className="p-8 text-center bg-[#1E293B] border border-[#334155] rounded-xl text-red-400">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Project Management</h2>
          <p className="text-[#94A3B8] mt-1">
            Manage projects and categories for team reports.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#3B82F6] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all font-medium"
        >
          <Plus size={18} className="mr-2" /> Add Project
        </button>
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
            <div className="col-span-full bg-[#1E293B] p-12 rounded-xl border border-[#334155] text-center">
              <Folder size={48} className="mx-auto text-[#334155] mb-4" />
              <h3 className="text-lg font-medium text-[#F8FAFC] mb-2">No projects yet</h3>
              <p className="text-[#94A3B8] mb-6">Create the first project to get started.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-[#3B82F6]/30 transition-colors flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-[#F8FAFC] text-lg mb-1 flex items-center">
                    <Folder size={16} className="mr-2 text-[#3B82F6]" />
                    {project.name}
                  </h3>
                  <p className="text-sm text-[#94A3B8] line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#334155] flex justify-end gap-2">
                  <button
                    onClick={() => openModal(project)}
                    className="p-2 text-[#94A3B8] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-2 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#334155]">
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button onClick={closeModal} className="text-[#94A3B8] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <div className="pt-4 flex justify-end gap-3">
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
