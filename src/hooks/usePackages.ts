
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/cashtele';
import { InvestmentPackage } from '@/components/packages/PackageInterface';

export const usePackages = () => {
  const { user } = useAuth();
  const { balance, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load investment packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (packageData: InvestmentPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invest",
        variant: "destructive",
      });
      return;
    }

    if (balance < packageData.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${formatCurrency(packageData.price)} to invest in this package`,
        variant: "destructive",
      });
      return;
    }

    setInvesting(packageData.id);

    try {
      const investmentAmount = packageData.price;
      const dailyEarning = packageData.daily_earning;

      // Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          package_id: packageData.id,
          amount: investmentAmount,
          daily_earning: dailyEarning,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        });

      if (investmentError) throw investmentError;

      // Deduct from wallet balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          wallet_balance: balance - investmentAmount
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: investmentAmount,
          status: 'completed',
          description: `Investment in ${packageData.name}`,
          completed_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      await refreshWallet();

      toast({
        title: "Investment Successful!",
        description: `You have successfully invested ${formatCurrency(investmentAmount)} in ${packageData.name}`,
      });

      // Redirect to investments page
      window.location.href = '/dashboard/investments';

    } catch (error: any) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to process investment",
        variant: "destructive",
      });
    } finally {
      setInvesting(null);
    }
  };

  return {
    packages,
    loading,
    investing,
    balance,
    handleInvest
  };
};
