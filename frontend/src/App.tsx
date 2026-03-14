import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Existing pages
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

// Mentor pages
import MentorSignup from './pages/mentor/MentorSignup';
import MentorPending from './pages/mentor/MentorPending';
import MentorLobby from './pages/mentor/MentorLobby';
import MenteeCardPage from './pages/mentor/MenteeCardPage';
import RoadmapBuilder from './pages/mentor/RoadmapBuilder';
import Chat from './pages/mentor/Chat';
import SessionDetail from './pages/mentor/SessionDetail';

// Mentor tab pages
import ProfileTab from './pages/mentor/tabs/ProfileTab';
import MyMenteesTab from './pages/mentor/tabs/MyMenteesTab';
import CalendarTab from './pages/mentor/tabs/CalendarTab';
import EarningsTab from './pages/mentor/tabs/EarningsTab';
import ReviewsTab from './pages/mentor/tabs/ReviewsTab';
import AvailabilityTab from './pages/mentor/tabs/AvailabilityTab';
import InboxTab from './pages/mentor/tabs/InboxTab';

// Public mentor pages
import MentorPublicProfile from './pages/MentorPublicProfile';
import MentorBrowse from './pages/MentorBrowse';

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

          {/* Public mentor pages */}
          <Route path="/m/:username" element={<MentorPublicProfile />} />
          <Route path="/mentors" element={<MentorBrowse />} />

          {/* Protected routes with sidebar layout */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/interview-selection" element={<ProtectedRoute><DashboardLayout><InterviewSelection /></DashboardLayout></ProtectedRoute>} />
          <Route path="/interview/:interviewId" element={<ProtectedRoute><DashboardLayout><Interview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/results/:interviewId" element={<ProtectedRoute><DashboardLayout><Results /></DashboardLayout></ProtectedRoute>} />
          <Route path="/job-library" element={<ProtectedRoute><JobLibrary /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

          {/* Mentor routes (protected, full-screen — no existing sidebar) */}
          <Route path="/mentor/signup" element={<ProtectedRoute><MentorSignup /></ProtectedRoute>} />
          <Route path="/mentor/pending" element={<ProtectedRoute><MentorPending /></ProtectedRoute>} />
          <Route path="/mentor/lobby" element={<ProtectedRoute><MentorLobby /></ProtectedRoute>} />
          <Route path="/mentor/mentee/:id" element={<ProtectedRoute><MenteeCardPage /></ProtectedRoute>} />
          <Route path="/mentor/roadmap/:connectionId" element={<ProtectedRoute><RoadmapBuilder /></ProtectedRoute>} />
          <Route path="/mentor/chat/:connectionId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/mentor/session/:sessionId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />

          {/* Mentor side panel tabs */}
          <Route path="/mentor/profile" element={<ProtectedRoute><ProfileTab /></ProtectedRoute>} />
          <Route path="/mentor/mentees" element={<ProtectedRoute><MyMenteesTab /></ProtectedRoute>} />
          <Route path="/mentor/calendar" element={<ProtectedRoute><CalendarTab /></ProtectedRoute>} />
          <Route path="/mentor/earnings" element={<ProtectedRoute><EarningsTab /></ProtectedRoute>} />
          <Route path="/mentor/reviews" element={<ProtectedRoute><ReviewsTab /></ProtectedRoute>} />
          <Route path="/mentor/availability" element={<ProtectedRoute><AvailabilityTab /></ProtectedRoute>} />
          <Route path="/mentor/inbox" element={<ProtectedRoute><InboxTab /></ProtectedRoute>} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
