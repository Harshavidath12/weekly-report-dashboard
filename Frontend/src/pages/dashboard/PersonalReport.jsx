import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, FileText, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import ReportForm from '../../components/reports/ReportForm';
import reportService from '../../services/reportService';

const PersonalReport = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (reportData) => {
    try {
      setIsSaving(true);
      if (view === 'create') {
        await reportService.createReport(reportData);
      } else if (view === 'edit' && selectedReport) {
        await reportService.updateReport(selectedReport._id, reportData);
      }
      await fetchReports();
      setView('list');
      setSelectedReport(null);
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report. Please check your inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setView('edit');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && view === 'list') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#3B82F6]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">My Weekly Reports</h2>
          <p className="text-[#94A3B8] mt-1">
            Manage your personal report submissions.
          </p>
        </div>
        
        {view === 'list' ? (
          <button
            onClick={() => setView('create')}
            className="flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#3B82F6] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all font-medium"
          >
            <Plus size={18} className="mr-2" /> New Report
          </button>
        ) : (
          <button
            onClick={() => { setView('list'); setSelectedReport(null); }}
            className="flex items-center px-4 py-2 bg-[#1E293B] text-[#F8FAFC] border border-[#334155] rounded-lg hover:bg-white/5 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to List
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {view === 'list' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-[#1E293B] p-12 rounded-xl border border-[#334155] text-center">
              <FileText size={48} className="mx-auto text-[#334155] mb-4" />
              <h3 className="text-lg font-medium text-[#F8FAFC] mb-2">No reports yet</h3>
              <p className="text-[#94A3B8] mb-6">Create your first weekly report to get started.</p>
              <button
                onClick={() => setView('create')}
                className="inline-flex items-center px-4 py-2 bg-[#1E293B] text-[#F8FAFC] border border-[#334155] hover:border-[#3B82F6]/50 rounded-lg transition-colors"
              >
                <Plus size={18} className="mr-2 text-[#3B82F6]" /> Create Report
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div 
                  key={report._id} 
                  className="bg-[#1E293B] p-5 rounded-xl border border-[#334155] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#3B82F6]/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-[#F8FAFC] text-lg">
                        {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.submissionStatus === 'submitted' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {report.submissionStatus.charAt(0).toUpperCase() + report.submissionStatus.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                      {report.project?.name || 'Unknown Project'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(report)}
                    className="flex items-center px-4 py-2 text-sm bg-[#0F172A] text-[#F8FAFC] border border-[#334155] rounded-lg hover:border-[#3B82F6] transition-colors"
                  >
                    {report.submissionStatus === 'submitted' ? (
                      <><FileText size={16} className="mr-2 text-[#94A3B8]" /> View</>
                    ) : (
                      <><Edit2 size={16} className="mr-2 text-[#3B82F6]" /> Edit</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(view === 'create' || view === 'edit') && (
        <ReportForm 
          initialData={selectedReport} 
          onSave={handleSaveReport} 
          isSaving={isSaving} 
        />
      )}
    </div>
  );
};

export default PersonalReport;
