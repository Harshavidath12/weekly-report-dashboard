import { useState, useEffect } from 'react';
import { Plus, X, Save, Send, CheckCircle2, Loader2 } from 'lucide-react';
import projectService from '../../services/projectService';

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

  const inputClasses = "mt-1 block w-full bg-[#0D1626] border border-white/5 rounded-lg shadow-sm py-2.5 px-4 text-[#FFFFFF] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] sm:text-sm transition-colors";
  const labelClasses = "block text-sm font-medium text-[#94A3B8] mb-1";

  const isReadOnly = initialData?.submissionStatus === 'submitted';

  return (
    <div className="bg-[#1E293B] p-6 rounded-xl shadow-lg border border-[#334155]">
      {isReadOnly && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center">
          <CheckCircle2 size={18} className="mr-2" />
          This report has been submitted and is read-only.
        </div>
      )}

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Week Start Date</label>
            <input
              type="date"
              name="weekStartDate"
              value={formData.weekStartDate}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Week End Date</label>
            <input
              type="date"
              name="weekEndDate"
              value={formData.weekEndDate}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Project or Category Tag</label>
          {isLoadingProjects ? (
            <div className="flex items-center text-sm text-[#94A3B8] h-11 px-4 bg-[#0D1626] border border-white/5 rounded-lg shadow-sm">
              <Loader2 className="animate-spin mr-2" size={16} /> Loading projects...
            </div>
          ) : (
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className={inputClasses}
            >
              <option value="" disabled>Select a project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tasks Completed */}
        <div>
          <label className={labelClasses}>Tasks Completed</label>
          <div className="space-y-3">
            {formData.tasksCompleted.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value, 'tasksCompleted')}
                  placeholder="What did you accomplish?"
                  disabled={isReadOnly}
                  className={inputClasses + " mt-0"}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTask(index, 'tasksCompleted')}
                    className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => addTask('tasksCompleted')}
              className="mt-3 flex items-center text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium"
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          )}
        </div>

        {/* Tasks Planned */}
        <div>
          <label className={labelClasses}>Tasks Planned for Next Week</label>
          <div className="space-y-3">
            {formData.tasksPlanned.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value, 'tasksPlanned')}
                  placeholder="What are you planning to do?"
                  disabled={isReadOnly}
                  className={inputClasses + " mt-0"}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTask(index, 'tasksPlanned')}
                    className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => addTask('tasksPlanned')}
              className="mt-3 flex items-center text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium"
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          )}
        </div>

        <div>
          <label className={labelClasses}>Blockers / Challenges</label>
          <textarea
            name="blockers"
            value={formData.blockers}
            onChange={handleChange}
            placeholder="Any issues preventing progress?"
            disabled={isReadOnly}
            rows={3}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Hours Worked (Optional)</label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleChange}
              placeholder="e.g. 40"
              disabled={isReadOnly}
              min="0"
              max="168"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Notes or Links (Optional)</label>
          <textarea
            name="notesOrLinks"
            value={formData.notesOrLinks}
            onChange={handleChange}
            placeholder="Links to PRs, documents, or general notes"
            disabled={isReadOnly}
            rows={2}
            className={inputClasses}
          />
        </div>

        {!isReadOnly && (
          <div className="pt-6 flex items-center justify-end gap-4 border-t border-[#334155]">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-[#1E293B] text-[#F8FAFC] border border-[#334155] rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 font-medium"
            >
              <Save size={18} className="mr-2 text-[#94A3B8]" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'submitted')}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#3B82F6] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all disabled:opacity-50 font-medium"
            >
              <Send size={18} className="mr-2" />
              Submit Report
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReportForm;
