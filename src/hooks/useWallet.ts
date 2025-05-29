
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  payment_method?: string;
  reference_id?: string;
  phone_number?: string;
  description?: string;
  created_at: string;
  completed_at?: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    transactions: [],
    loading: true,
  });

  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      setWalletData({
        balance: 0,
        transactions: [],
        loading: false,
      });
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    try {
      setWalletData(prev => ({ ...prev, loading: true }));
      
      // Fetch user profile with wallet balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Fetch recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Transactions error:', transactionsError);
        throw transactionsError;
      }

      setWalletData({
        balance: profile?.wallet_balance || 0,
        transactions: transactions || [],
        loading: false,
      });
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
      setWalletData(prev => ({ ...prev, loading: false }));
    }
  };

  const createTransaction = async (transactionData: {
    type: string;
    amount: number;
    payment_method?: string;
    phone_number?: string;
    description?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ...transactionData,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh wallet data after creating transaction
      await fetchWalletData();
      
      return data;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  return {
    ...walletData,
    refreshWallet: fetchWalletData,
    createTransaction,
  };
};
