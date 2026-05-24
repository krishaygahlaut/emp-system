import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import Login from './pages/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendancePage from './pages/Attendance';
import Leaves from './pages/Leaves';
import Schedules from './pages/Schedules';
import Reports from './pages/Reports';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLeaves from './pages/EmployeeLeaves';
import EmployeeSchedule from './pages/EmployeeSchedule';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />

          <Route path="/" element={
            <ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="/employee" element={
            <ProtectedRoute role="employee"><EmployeeLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leaves" element={<EmployeeLeaves />} />
            <Route path="schedule" element={<EmployeeSchedule />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontSize: '13px' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
