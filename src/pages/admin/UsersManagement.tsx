
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/pesapal';
import { Users, Wallet, Plus, Minus, Eye, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  wallet_balance: number;
  role: string;
  created_at: string;
  phone: string;
}

const UsersManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionAmount, setActionAmount] = useState('');
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

  const handleBalanceAction = async () => {
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

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.id,
          type: actionType === 'add' ? 'admin_deposit' : 'admin_withdrawal',
          amount: amount,
          status: 'completed',
          payment_method: 'admin_action',
          description: `Admin ${actionType === 'add' ? 'added' : 'withdrew'} ${formatCurrency(amount)} ${actionType === 'add' ? 'to' : 'from'} user wallet`,
          completed_at: new Date().toISOString(),
          metadata: {
            admin_action: true,
            previous_balance: selectedUser.wallet_balance,
            new_balance: newBalance
          }
        });

      toast({
        title: "Success",
        description: `Successfully ${actionType === 'add' ? 'added' : 'withdrew'} ${formatCurrency(amount)}`,
      });

      setDialogOpen(false);
      setActionAmount('');
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
  const totalBalance = users.reduce((sum, user) => sum + user.wallet_balance, 0);
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and balances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and wallet balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium">{user.full_name || 'No name'}</h3>
                      <p className="text-sm text-gray-600">{user.phone || 'No phone'}</p>
                      <p className="text-xs text-gray-500">
                        Role: {user.role} • Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(user.wallet_balance)}
                    </div>
                    <div className="text-sm text-gray-600">Wallet Balance</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionType('add');
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionType('withdraw');
                        setDialogOpen(true);
                      }}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? 'Add Money' : 'Withdraw Money'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'add' ? 'Add money to' : 'Withdraw money from'} {selectedUser?.full_name}'s wallet
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <div className="text-lg font-semibold">
                {selectedUser && formatCurrency(selectedUser.wallet_balance)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleBalanceAction}
                className="flex-1"
                disabled={!actionAmount}
              >
                {actionType === 'add' ? 'Add Money' : 'Withdraw Money'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
