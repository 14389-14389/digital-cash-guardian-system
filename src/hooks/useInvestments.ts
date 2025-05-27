
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Investment {
  id: string;
  package_id: string;
  amount: number;
  daily_earning: number;
  status: string;
  days_completed: number;
  total_earned: number;
  start_date: string;
  end_date: string;
  created_at: string;
  packages: {
    name: string;
    type: string;
    duration_days: number;
  };
}

interface InvestmentStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  dailyEarning: number;
}

export const useInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats>({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    dailyEarning: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          packages (
            name,
            type,
            duration_days
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvestments(data || []);
      
      // Calculate stats
      const totalInvested = data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const totalEarned = data?.reduce((sum, inv) => sum + inv.total_earned, 0) || 0;
      const activeInvestments = data?.filter(inv => inv.status === 'active').length || 0;
      const dailyEarning = data?.filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.daily_earning, 0) || 0;

      setStats({
        totalInvested,
        totalEarned,
        activeInvestments,
        dailyEarning,
      });
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      toast({
        title: "Error",
        description: "Failed to load investments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    investments,
    stats,
    loading,
    refreshInvestments: fetchInvestments,
  };
};
