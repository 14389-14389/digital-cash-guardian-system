
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalInvestments: number;
  totalPackages: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  totalBalance: number;
  totalWithdrawals: number;
}

export const useAdminStats = (isAdmin: boolean) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvestments: 0,
    totalPackages: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    totalBalance: 0,
    totalWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch total balance from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('wallet_balance');

      if (profilesError) throw profilesError;

      // Fetch completed withdrawals for total
      const { data: completedWithdrawals, error: completedWithdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'completed');

      if (completedWithdrawalsError) throw completedWithdrawalsError;

      const totalRevenue = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const totalBalance = profiles?.reduce((sum, profile) => sum + (profile.wallet_balance || 0), 0) || 0;
      const totalWithdrawals = completedWithdrawals?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalInvestments: investments?.length || 0,
        totalPackages: packageCount || 0,
        totalRevenue,
        pendingWithdrawals: pendingCount || 0,
        totalBalance,
        totalWithdrawals
      });

      console.log('Admin stats loaded successfully');
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setError(error.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    } else if (!loading) {
      setLoading(false);
    }
  }, [isAdmin, loading]);

  return { stats, loading, error, refetch: fetchAdminStats };
};
