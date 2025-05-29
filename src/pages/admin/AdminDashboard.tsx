
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { isAdmin, user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    totalPackages: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    } else if (!loading) {
      setLoading(false);
    }
  }, [isAdmin, loading]);

  const fetchAdminStats = async () => {
    try {
      setError(null);
      console.log('Fetching admin stats...');

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Fetch investment stats
      const { data: investments, error: investmentError } = await supabase
        .from('investments')
        .select('amount');

      if (investmentError) throw investmentError;

      // Fetch package count
      const { count: packageCount, error: packageError } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (packageError) throw packageError;

      // Fetch pending withdrawals
      const { count: pendingCount, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (withdrawalError) throw withdrawalError;

      const totalRevenue = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalInvestments: investments?.length || 0,
        totalPackages: packageCount || 0,
        totalRevenue,
        pendingWithdrawals: pendingCount || 0
      });

      console.log('Admin stats loaded successfully');
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setError(error.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <div className="text-sm text-gray-500">
          <p>Current user: {user?.email || 'Not logged in'}</p>
          <p>Profile role: {profile?.role || 'None'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700">{error}</p>
                <Button 
                  onClick={() => fetchAdminStats()} 
                  variant="outline" 
                  className="mt-2"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {profile?.full_name || user?.email} • Platform overview and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingWithdrawals}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button 
              onClick={() => window.location.href = '/dashboard/admin/users'}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
            >
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-gray-600">View and manage user accounts</div>
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/admin/packages'}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
            >
              <div className="font-medium">Manage Packages</div>
              <div className="text-sm text-gray-600">Create and edit investment packages</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
