
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Package, 
  TrendingUp, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Banknote,
  Shield,
  BarChart3,
  UserCog
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Packages', path: '/dashboard/packages' },
    { icon: TrendingUp, label: 'My Investments', path: '/dashboard/investments' },
    { icon: CreditCard, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: CreditCard, label: 'Withdrawals', path: '/dashboard/withdrawals' },
    { icon: Users, label: 'Referrals', path: '/dashboard/referrals' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Admin Panel', path: '/dashboard/admin' },
    { icon: UserCog, label: 'Users Management', path: '/dashboard/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/admin/analytics' },
    { icon: Package, label: 'Manage Packages', path: '/dashboard/admin/packages' },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 h-full flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Banknote className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Cash-telle</h1>
        </div>
        {isAdmin && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin - kevinkisaa@gmail.com
            </span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              navigate(item.path);
              if (mobile) setSidebarOpen(false);
            }}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))}
        
        {isAdmin && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
              Admin Panel
            </div>
            {adminMenuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  if (mobile) setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 text-sm text-gray-600">
          {user?.email}
          {isAdmin && (
            <div className="text-xs text-purple-600 font-medium mt-1">
              M-Pesa Account: 0743455893
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
