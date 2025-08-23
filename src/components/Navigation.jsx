import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'ADMIN' ? '/admin' : '/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to={isAuthenticated ? getDashboardLink() : '/'} className="text-xl font-bold mr-8">RPMS</Link>
          
          {isAuthenticated && (
            <div className="hidden md:flex space-x-6">
              {user?.role === 'ADMIN' ? (
                <>
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                  <Link to="/admin/users" className="text-gray-600 hover:text-gray-900">Users</Link>
                  <Link to="/admin/papers" className="text-gray-600 hover:text-gray-900">Papers</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationCenter />
              
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2 hidden md:inline">
                  {user?.username}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;