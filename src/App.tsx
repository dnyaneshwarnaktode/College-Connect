import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Forums from './pages/Forums';
import Projects from './pages/Projects';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
// New feature pages
import TeamChat from './pages/TeamChat';
import ClassGroups from './pages/ClassGroups';
import ClassGroupDetail from './pages/ClassGroupDetail';

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
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="forums" element={<Forums />} />
        <Route path="projects" element={<Projects />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:teamId/chat" element={<TeamChat />} />
        <Route path="class-groups" element={<ClassGroups />} />
        <Route path="class-groups/:id" element={<ClassGroupDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <Router>
              <div className="min-h-screen bg-dark-950 dark:bg-dark-950 transition-colors">
                <AuthenticatedApp />
              </div>
            </Router>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;