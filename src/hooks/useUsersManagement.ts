
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/components/admin/users/UserProfileInterface';

export const useUsersManagement = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'add' | 'withdraw'>('add');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAction = async (actionAmount: string) => {
    if (!selectedUser || !actionAmount) return;

    try {
      const amount = parseInt(actionAmount);
      const newBalance = actionType === 'add' 
        ? selectedUser.wallet_balance + amount 
        : selectedUser.wallet_balance - amount;

      if (newBalance < 0) {
        toast({
          title: "Invalid Action",
          description: "Cannot withdraw more than available balance",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.id,
          type: actionType === 'add' ? 'admin_deposit' : 'admin_withdrawal',
          amount: amount,
          status: 'completed',
          payment_method: 'admin_action',
          description: `Admin ${actionType === 'add' ? 'added' : 'withdrew'} KES ${amount.toLocaleString()} ${actionType === 'add' ? 'to' : 'from'} user wallet`,
          completed_at: new Date().toISOString(),
          metadata: {
            admin_action: true,
            previous_balance: selectedUser.wallet_balance,
            new_balance: newBalance
          }
        });

      toast({
        title: "Success",
        description: `Successfully ${actionType === 'add' ? 'added' : 'withdrew'} KES ${amount.toLocaleString()}`,
      });

      setDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddMoney = (user: UserProfile) => {
    setSelectedUser(user);
    setActionType('add');
    setDialogOpen(true);
  };

  const handleWithdrawMoney = (user: UserProfile) => {
    setSelectedUser(user);
    setActionType('withdraw');
    setDialogOpen(true);
  };

  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.wallet_balance > 0).length;
    const newUsersThisMonth = users.filter(user => {
      const userCreated = new Date(user.created_at);
      const now = new Date();
      return userCreated.getMonth() === now.getMonth() && userCreated.getFullYear() === now.getFullYear();
    }).length;
    const adminUsers = users.filter(user => user.role === 'admin').length;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      adminUsers
    };
  };

  return {
    users,
    loading,
    selectedUser,
    actionType,
    dialogOpen,
    setDialogOpen,
    handleBalanceAction,
    handleAddMoney,
    handleWithdrawMoney,
    calculateStats,
    fetchUsers
  };
};
