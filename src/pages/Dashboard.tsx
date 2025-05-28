
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, CreditCard, Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalInvestments: number;
  totalEarnings: number;
  activeInvestments: number;
  totalReferrals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestments: 0,
    totalEarnings: 0,
    activeInvestments: 0,
    totalReferrals: 0,
  });
  const [recentCommissions, setRecentCommissions] = useState<any[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user?.id);

      const { data: commissions } = await supabase
        .from('daily_commissions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user?.id);

      const totalInvestments = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const totalEarnings = investments?.reduce((sum, inv) => sum + inv.total_earned, 0) || 0;
      const activeInvestments = investments?.filter(inv => inv.status === 'active').length || 0;

      setStats({
        totalInvestments,
        totalEarnings,
        activeInvestments,
        totalReferrals: referrals?.length || 0,
      });

      setRecentCommissions(commissions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 sm:h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Investments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-lg sm:text-2xl font-bold truncate">
                {balanceVisible ? formatCurrency(stats.totalInvestments) : '••••••'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="flex-shrink-0"
              >
                {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
              {balanceVisible ? formatCurrency(stats.totalEarnings) : '••••••'}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Investments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.activeInvestments}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Commissions</CardTitle>
          <CardDescription>
            Your latest commission payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentCommissions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No commissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentCommissions.map((commission) => (
                <div key={commission.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">Day {commission.day_number} Commission</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(commission.commission_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-green-600 font-semibold text-sm sm:text-base">
                    +{formatCurrency(commission.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
