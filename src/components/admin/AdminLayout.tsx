// src/components/admin/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Video, 
  Tag, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { account, isAdmin } = await authService.getCurrentUserWithRole();
      if (!isAdmin) {
        navigate('/');
      } else {
        setAdminName(account?.full_name || 'Admin');
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/videos', icon: Video, label: 'Featured Videos' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-theme-primary">Admin Panel</h1>
            ) : (
              <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                        isActive ? 'bg-gray-100 text-theme-primary border-r-4 border-theme-primary' : ''
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{adminName.charAt(0)}</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
            <NavLink
              to="/"
              className="flex items-center gap-3 mt-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              {sidebarOpen && <span>Back to Store</span>}
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};