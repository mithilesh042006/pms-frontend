import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import UserDetail from '@/pages/admin/UserDetail';
import CreateUser from '@/pages/admin/CreateUser';
import PaperAssignment from '@/pages/admin/PaperAssignment';
import PaperReview from '@/pages/admin/PaperReview';

// User Pages
import UserDashboard from '@/pages/user/Dashboard';
import PaperworkDetail from '@/pages/paperworks/PaperworkDetail';
import PaperworkSubmit from '@/pages/paperworks/PaperworkSubmit';
import CreatePaperwork from '@/pages/user/CreatePaperwork';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Navigation />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/create" element={
            <ProtectedRoute requiredRole="ADMIN">
              <CreateUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:userId" element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/papers" element={
            <ProtectedRoute requiredRole="ADMIN">
              <PaperAssignment />
            </ProtectedRoute>
          } />
          <Route path="/admin/papers/:paperId" element={
            <ProtectedRoute requiredRole="ADMIN">
              <PaperReview />
            </ProtectedRoute>
          } />
          
          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="RESEARCHER">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/papers/:paperId" element={
            <ProtectedRoute requiredRole="RESEARCHER">
              <PaperworkDetail />
            </ProtectedRoute>
          } />
          <Route path="/papers/:paperId/submit" element={
            <ProtectedRoute requiredRole="RESEARCHER">
              <PaperworkSubmit />
            </ProtectedRoute>
          } />
          <Route path="/papers/create" element={
            <ProtectedRoute requiredRole="RESEARCHER">
              <CreatePaperwork />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App