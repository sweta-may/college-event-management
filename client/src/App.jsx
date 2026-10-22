import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout       from './components/AppLayout';
import ProtectedRoute  from './components/ProtectedRoute';
import HomePage            from './pages/HomePage';
import EventsPage          from './pages/EventsPage';
import EventDetailsPage    from './pages/EventDetailsPage';
import LoginPage           from './pages/LoginPage';
import SignupPage          from './pages/SignupPage';
import DashboardPage       from './pages/DashboardPage';
import RegistrationsPage   from './pages/RegistrationsPage';
import UnauthorizedPage    from './pages/UnauthorizedPage';
import NotFoundPage        from './pages/NotFoundPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/"               element={<HomePage />} />
            <Route path="/events"         element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/signup"         element={<SignupPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/registrations" element={
              <ProtectedRoute roles={['student']}>
                <RegistrationsPage />
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*"             element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
