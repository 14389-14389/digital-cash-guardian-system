
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import UserStatsCards from '@/components/admin/UserStatsCards';
import UserCard from '@/components/admin/UserCard';
import BalanceActionDialog from '@/components/admin/BalanceActionDialog';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  wallet_balance: number;
  role: string;
  created_at: string;
}

const UsersManagement = () => {
  const { isAdmin } = useAuth();
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

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.wallet_balance > 0).length;
  const newUsersThisMonth = users.filter(user => {
    const userCreated = new Date(user.created_at);
    const now = new Date();
    return userCreated.getMonth() === now.getMonth() && userCreated.getFullYear() === now.getFullYear();
  }).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and balances</p>
      </div>

      <UserStatsCards 
        stats={{
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          adminUsers
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and wallet balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={{
                  id: user.id,
                  email: user.full_name || 'No Name',
                  full_name: user.full_name,
                  phone_number: user.phone,
                  wallet_balance: user.wallet_balance,
                  created_at: user.created_at,
                  is_admin: user.role === 'admin'
                }}
                onAddFunds={handleAddMoney}
                onDeductFunds={handleWithdrawMoney}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <BalanceActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser ? {
          id: selectedUser.id,
          email: selectedUser.full_name || 'No Name',
          full_name: selectedUser.full_name,
          phone_number: selectedUser.phone,
          wallet_balance: selectedUser.wallet_balance,
          created_at: selectedUser.created_at,
          is_admin: selectedUser.role === 'admin'
        } : null}
        actionType={actionType}
        onConfirm={handleBalanceAction}
      />
    </div>
  );
};

export default UsersManagement;
