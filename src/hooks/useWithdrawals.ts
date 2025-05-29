
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  notes: string | null;
  phone: string;
  full_name: string | null;
  wallet_balance: number;
}

export const useWithdrawals = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      // First get all withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      if (!withdrawalsData || withdrawalsData.length === 0) {
        setWithdrawals([]);
        return;
      }

      // Get unique user IDs from withdrawals
      const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, wallet_balance')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles for quick lookup
      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      // Combine withdrawal data with profile data
      const withdrawalsWithProfiles: Withdrawal[] = withdrawalsData.map(w => {
        const profile = profilesMap.get(w.user_id);
        return {
          ...w,
          full_name: profile?.full_name || null,
          wallet_balance: profile?.wallet_balance || 0
        };
      });

      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject', adminNotes: string) => {
    setProcessingId(withdrawalId);
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      if (action === 'approve') {
        // Update withdrawal status
        const { error: withdrawalError } = await supabase
          .from('withdrawals')
          .update({
            status: 'approved',
            processed_at: new Date().toISOString(),
            notes: adminNotes,
          })
          .eq('id', withdrawalId);

        if (withdrawalError) throw withdrawalError;

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: withdrawal.user_id,
            type: 'withdrawal',
            amount: -withdrawal.amount,
            status: 'completed',
            payment_method: 'mpesa',
            phone_number: withdrawal.phone,
            description: `Withdrawal of KES ${withdrawal.amount.toLocaleString()} to ${withdrawal.phone}`,
            completed_at: new Date().toISOString(),
            related_withdrawal_id: withdrawalId,
          });

        if (transactionError) throw transactionError;

        // Update user wallet balance
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: withdrawal.wallet_balance - withdrawal.amount
          })
          .eq('id', withdrawal.user_id);

        if (balanceError) throw balanceError;

        toast({
          title: "Withdrawal Approved",
          description: `KES ${withdrawal.amount.toLocaleString()} withdrawal has been approved and processed`,
        });
      } else {
        // Reject withdrawal
        const { error } = await supabase
          .from('withdrawals')
          .update({
            status: 'rejected',
            processed_at: new Date().toISOString(),
            notes: adminNotes,
          })
          .eq('id', withdrawalId);

        if (error) throw error;

        toast({
          title: "Withdrawal Rejected",
          description: "The withdrawal request has been rejected",
        });
      }

      // Refresh the withdrawals list
      await fetchWithdrawals();

    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return {
    withdrawals,
    loading,
    processingId,
    processWithdrawal,
    refetch: fetchWithdrawals
  };
};
