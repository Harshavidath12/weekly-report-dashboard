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
      const data = await (user?.role === 'Manager' ? reportService.getAllReports() : reportService.getMyReports());
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
          <h2 className="text-2xl font-bold text-slate-900">{user?.role === 'Manager' ? 'Team Weekly Reports' : 'My Weekly Reports'}</h2>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Manager' ? 'View and analyze reports submitted by the whole team.' : 'Manage your personal report submissions.'}
          </p>
        </div>
        
        {view === 'list' ? (
          user?.role !== 'Manager' && (
            <button
              onClick={() => setView('create')}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm transition-all font-medium"
            >
              <Plus size={18} className="mr-2" /> New Report
            </button>
          )
        ) : (
          <button
            onClick={() => { setView('list'); setSelectedReport(null); }}
            className="flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to List
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {view === 'list' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-sm text-center">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No reports yet</h3>
              <p className="text-slate-500 mb-6">{user?.role === 'Manager' ? 'No reports have been submitted by the team yet.' : 'Create your first weekly report to get started.'}</p>
              {user?.role !== 'Manager' && (
                <button
                  onClick={() => setView('create')}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors font-medium"
                >
                  <Plus size={18} className="mr-2" /> Create Report
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div 
                  key={report._id} 
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:scale-[1.01] hover:shadow-[0_8px_25px_rgba(168,85,247,0.12)] transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">
                        {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.submissionStatus === 'submitted' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {report.submissionStatus.charAt(0).toUpperCase() + report.submissionStatus.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      {user?.role === 'Manager' && (
                        <>
                          <span className="font-semibold text-slate-700">{report.user?.name || 'Unknown User'}</span>
                          <span className="text-slate-300">•</span>
                        </>
                      )}
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {report.project?.name || 'Unknown Project'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(report)}
                    className="flex items-center px-4 py-2 text-sm border border-orange-600 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    {report.submissionStatus === 'submitted' || (report.user?._id || report.user) !== user?._id ? (
                      <><FileText size={16} className="mr-2 text-orange-500" /> View</>
                    ) : (
                      <><Edit2 size={16} className="mr-2 text-orange-500" /> Edit</>
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
