import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import InterviewSelection from './pages/InterviewSelection';
import Interview from './pages/Interview';
import Results from './pages/Results';
import JobLibrary from './pages/JobLibrary';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-selection"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <InterviewSelection />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview/:interviewId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Interview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:interviewId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Results />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-library"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobLibrary />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
