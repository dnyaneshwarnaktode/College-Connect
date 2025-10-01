import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignUpForm';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Forums from './pages/Forums';
import Projects from './pages/Projects';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/analytics';

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="forums" element={<Forums />} />
        <Route path="projects" element={<Projects />} />
        <Route path="teams" element={<Teams />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <AuthenticatedApp />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;