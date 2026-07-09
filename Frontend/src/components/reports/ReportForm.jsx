import { useState, useEffect } from 'react';
import { Plus, X, Save, Send, CheckCircle2, Loader2, Calendar, Folder, Clock, CheckSquare, ListTodo, AlertCircle, Link as LinkIcon, FileText } from 'lucide-react';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';

const ReportForm = ({ initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    weekStartDate: '',
    weekEndDate: '',
    project: '',
    tasksCompleted: [''],
    tasksPlanned: [''],
    blockers: '',
    hoursWorked: '',
    notesOrLinks: '',
    submissionStatus: 'draft'
  });
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Format dates for input type="date"
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
      };

      setFormData({
        ...initialData,
        project: initialData.project?._id || initialData.project || '',
        weekStartDate: formatDate(initialData.weekStartDate),
        weekEndDate: formatDate(initialData.weekEndDate),
        tasksCompleted: initialData.tasksCompleted?.length > 0 ? initialData.tasksCompleted : [''],
        tasksPlanned: initialData.tasksPlanned?.length > 0 ? initialData.tasksPlanned : [''],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (index, value, type) => {
    const updatedTasks = [...formData[type]];
    updatedTasks[index] = value;
    setFormData((prev) => ({ ...prev, [type]: updatedTasks }));
  };

  const addTask = (type) => {
    setFormData((prev) => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const removeTask = (index, type) => {
    const updatedTasks = formData[type].filter((_, i) => i !== index);
    if (updatedTasks.length === 0) updatedTasks.push(''); // Always keep one empty input
    setFormData((prev) => ({ ...prev, [type]: updatedTasks }));
  };

  const handleSubmit = (e, status) => {
    e.preventDefault();
    // Filter out empty tasks before submitting
    const cleanedData = {
      ...formData,
      tasksCompleted: formData.tasksCompleted.filter((t) => t.trim() !== ''),
      tasksPlanned: formData.tasksPlanned.filter((t) => t.trim() !== ''),
      submissionStatus: status,
    };
    onSave(cleanedData);
  };

  const inputClasses = "mt-2 block w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 hover:border-slate-300 transition-all shadow-sm text-[15px]";
  const labelClasses = "flex items-center text-sm font-semibold text-slate-700 mb-1.5";

  const isReadOnly = initialData?.submissionStatus === 'submitted' || (initialData && (initialData.user?._id || initialData.user) !== user?._id);

  // Find the selected project object for display in read-only view
  const selectedProjectObj = projects.find(p => p._id === formData.project);
  const projectName = selectedProjectObj ? selectedProjectObj.name : 'Unknown Project';

  if (isReadOnly) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-orange-500" size={24} />
              Weekly Report
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-sm ${
            initialData?.submissionStatus === 'submitted' 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {initialData?.submissionStatus === 'submitted' && <CheckCircle2 size={16} className="mr-1.5" />}
            {initialData?.submissionStatus === 'submitted' ? 'Submitted and Locked' : 'Draft (View Only)'}
          </span>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center text-slate-500 text-sm font-medium mb-2">
              <Calendar size={16} className="mr-2" /> Dates
            </div>
            <div className="text-slate-900 font-semibold">
              {formData.weekStartDate} <span className="text-slate-400 mx-1">to</span> {formData.weekEndDate}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center text-slate-500 text-sm font-medium mb-2">
              <Folder size={16} className="mr-2" /> Project
            </div>
            <div className="text-slate-900 font-semibold truncate" title={projectName}>
              {projectName}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center text-slate-500 text-sm font-medium mb-2">
              <Clock size={16} className="mr-2" /> Hours Worked
            </div>
            <div className="text-slate-900 font-semibold">
              {formData.hoursWorked ? `${formData.hoursWorked} hrs` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <CheckSquare className="text-orange-500 mr-2" size={20} />
            Tasks Completed
          </h3>
          {formData.tasksCompleted.length > 0 && formData.tasksCompleted[0] !== '' ? (
            <div className="space-y-3">
              {formData.tasksCompleted.map((task, index) => (
                <div key={index} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <div className="mt-0.5 bg-green-50 p-1 rounded text-green-600 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{task}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No tasks completed recorded.</p>
          )}
        </div>

        {/* Tasks Planned */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <ListTodo className="text-orange-500 mr-2" size={20} />
            Planned for Next Week
          </h3>
          {formData.tasksPlanned.length > 0 && formData.tasksPlanned[0] !== '' ? (
            <div className="space-y-3">
              {formData.tasksPlanned.map((task, index) => (
                <div key={index} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <div className="mt-0.5 bg-orange-50 p-1 rounded text-orange-600 shrink-0">
                    <CheckSquare size={16} />
                  </div>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{task}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No tasks planned recorded.</p>
          )}
        </div>

        {/* Blockers & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={16} />
              Blockers / Challenges
            </h3>
            {formData.blockers ? (
              <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-slate-800 leading-relaxed text-[15px]">
                {formData.blockers}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-500 italic text-[15px]">
                None reported.
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <LinkIcon className="text-blue-500 mr-2" size={16} />
              Notes & Links
            </h3>
            {formData.notesOrLinks ? (
              <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-xl text-slate-800 leading-relaxed text-[15px] break-words">
                {formData.notesOrLinks}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-500 italic text-[15px]">
                No additional notes.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Editable Form View
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-orange-500" size={24} />
          {initialData ? 'Edit Weekly Report' : 'Draft New Report'}
        </h2>
        <p className="text-slate-500 mt-1">Fill out the details below to log your progress.</p>
      </div>

      <form className="space-y-8">
        <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center">
            <Folder size={18} className="text-orange-500 mr-2" /> General Details
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>
                  <Calendar size={16} className="text-slate-400 mr-2" /> Week Start Date
                </label>
                <input
                  type="date"
                  name="weekStartDate"
                  value={formData.weekStartDate}
                  onChange={handleChange}
                  required
                  max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <Calendar size={16} className="text-slate-400 mr-2" /> Week End Date
                </label>
                <input
                  type="date"
                  name="weekEndDate"
                  value={formData.weekEndDate}
                  onChange={handleChange}
                  required
                  max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                <Folder size={16} className="text-slate-400 mr-2" /> Project or Category Tag
              </label>
              {isLoadingProjects ? (
                <div className="flex items-center text-sm text-slate-500 h-[50px] px-4 bg-white border border-slate-200 rounded-xl">
                  <Loader2 className="animate-spin mr-2" size={16} /> Loading projects...
                </div>
              ) : (
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                >
                  <option value="" disabled>Select a project</option>

                  <optgroup label="My Assigned Projects">
                    {projects.filter(p => p.assignedMembers?.includes(user?._id)).length === 0 ? (
                      <option disabled>You haven't joined any projects yet</option>
                    ) : (
                      projects.filter(p => p.assignedMembers?.includes(user?._id)).map((proj) => (
                        <option key={proj._id} value={proj._id}>
                          {proj.name}
                        </option>
                      ))
                    )}
                  </optgroup>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
          <label className={`${labelClasses} text-base mb-4`}>
            <CheckSquare size={18} className="text-slate-400 mr-2" /> Tasks Completed
          </label>
          <div className="space-y-3">
            {formData.tasksCompleted.map((task, index) => (
              <div key={index} className="flex items-start gap-2 relative group">
                <textarea
                  rows={2}
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value, 'tasksCompleted')}
                  placeholder="What did you accomplish?"
                  className={`${inputClasses} mt-0 resize-y`}
                />
                <button
                  type="button"
                  onClick={() => removeTask(index, 'tasksCompleted')}
                  className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Task"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addTask('tasksCompleted')}
            className="mt-5 flex items-center text-[14px] text-slate-600 hover:text-orange-700 hover:bg-orange-50 border border-transparent hover:border-orange-200 px-3 py-2 rounded-xl font-semibold transition-all"
          >
            <Plus size={16} className="mr-1.5" /> Add another task
          </button>
        </div>

        {/* Tasks Planned */}
        <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
          <label className={`${labelClasses} text-base mb-4`}>
            <ListTodo size={18} className="text-slate-400 mr-2" /> Tasks Planned for Next Week
          </label>
          <div className="space-y-3">
            {formData.tasksPlanned.map((task, index) => (
              <div key={index} className="flex items-start gap-2 relative group">
                <textarea
                  rows={2}
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value, 'tasksPlanned')}
                  placeholder="What are you planning to do?"
                  className={`${inputClasses} mt-0 resize-y`}
                />
                <button
                  type="button"
                  onClick={() => removeTask(index, 'tasksPlanned')}
                  className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Task"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addTask('tasksPlanned')}
            className="mt-5 flex items-center text-[14px] text-slate-600 hover:text-orange-700 hover:bg-orange-50 border border-transparent hover:border-orange-200 px-3 py-2 rounded-xl font-semibold transition-all"
          >
            <Plus size={16} className="mr-1.5" /> Add another task
          </button>
        </div>

        <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center">
            <AlertCircle size={18} className="text-orange-500 mr-2" /> Additional Details
          </h3>
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>
                <AlertCircle size={16} className="text-slate-400 mr-2" /> Blockers / Challenges
              </label>
              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                placeholder="Any issues preventing progress?"
                rows={3}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>
                  <Clock size={16} className="text-slate-400 mr-2" /> Hours Worked (Optional)
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  min="0"
                  max="168"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                <LinkIcon size={16} className="text-slate-400 mr-2" /> Notes or Links (Optional)
              </label>
              <textarea
                name="notesOrLinks"
                value={formData.notesOrLinks}
                onChange={handleChange}
                placeholder="Links to PRs, documents, or general notes"
                rows={2}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSaving}
            className="flex items-center px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-50 font-semibold shadow-sm"
          >
            <Save size={18} className="mr-2 text-slate-400" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'submitted')}
            disabled={isSaving}
            className="flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-sm transition-all disabled:opacity-50 font-semibold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send size={18} className="mr-2" />
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
