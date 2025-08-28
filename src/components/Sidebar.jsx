import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, FileText, LogOut, Clock, Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/admin/papers', label: 'Paper Assignment', icon: <FileText size={20} /> },
    // { path: '/admin/deadlines', label: 'Deadlines', icon: <Clock size={20} /> },
  ];

  const researcherNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/papers', label: 'My Papers', icon: <FileText size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : researcherNavItems;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-10 border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="text-xl font-bold text-blue-600">RPMS</Link>
      </div>
      
      <div className="px-4 py-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <p className="text-xs font-medium mt-1 inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{user?.role}</p>
        </div>

        {/* <div className="mb-4">
          <NotificationCenter />
        </div> */}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                          (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut size={20} className="mr-3 text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;