import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Auth from './pages/auth/Auth';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import PersonalReport from './pages/dashboard/PersonalReport';
import ProjectManager from './pages/dashboard/ProjectManager';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth?action=login" replace />} />
        <Route path="/register" element={<Navigate to="/auth?action=register" replace />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="personal" element={<PersonalReport />} />
          <Route path="projects" element={<ProjectManager />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
