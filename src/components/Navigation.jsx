import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">PMS</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Register</Link>
          </>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;