
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
  profiles: {
    full_name: string;
    wallet_balance: number;
  };
}

const WithdrawalsManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    if (isAdmin) {
      fetchWithdrawals();
    }
  }, [isAdmin]);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles:user_id (
            full_name,
            wallet_balance
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(withdrawalId);
    
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      // If approved, deduct from user's wallet and create transaction
      if (action === 'approve') {
        // Check if user has sufficient balance
        if (withdrawal.profiles.wallet_balance < withdrawal.amount) {
          toast({
            title: "Insufficient Balance",
            description: "User doesn't have enough balance for this withdrawal",
            variant: "destructive",
          });
          return;
        }

        // Deduct from wallet
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: withdrawal.profiles.wallet_balance - withdrawal.amount
          })
          .eq('id', withdrawal.user_id);

        if (balanceError) throw balanceError;

        // Create withdrawal transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: withdrawal.user_id,
            type: 'withdrawal',
            amount: withdrawal.amount,
            status: 'completed',
            payment_method: 'mpesa',
            phone_number: withdrawal.phone,
            description: `Withdrawal of ${formatCurrency(withdrawal.amount)} approved by admin`,
            completed_at: new Date().toISOString(),
            related_withdrawal_id: withdrawalId
          });

        if (transactionError) throw transactionError;
      }

      toast({
        title: "Success",
        description: `Withdrawal ${action}d successfully`,
      });

      fetchWithdrawals();
      setDialogOpen(false);
      setNotes('');
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (withdrawal: Withdrawal, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
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

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
        <p className="text-gray-600 mt-2">Review and approve user withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendingAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawals.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>Manage user withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</h3>
              <p className="text-gray-600">All withdrawal requests will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{withdrawal.profiles.full_name}</div>
                        <div className="text-sm text-gray-500">
                          Balance: {formatCurrency(withdrawal.profiles.wallet_balance)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </TableCell>
                    <TableCell>{withdrawal.phone}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(withdrawal.status)} flex items-center space-x-1 w-fit`}>
                        {getStatusIcon(withdrawal.status)}
                        <span>{withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(withdrawal.requested_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {withdrawal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => openActionDialog(withdrawal, 'approve')}
                            disabled={actionLoading === withdrawal.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(withdrawal, 'reject')}
                            disabled={actionLoading === withdrawal.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {withdrawal.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Note:</strong> {withdrawal.notes}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Approve this withdrawal request. The amount will be deducted from the user\'s wallet.'
                : 'Reject this withdrawal request. Please provide a reason.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>User:</strong> {selectedWithdrawal.profiles.full_name}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount)}</p>
                <p><strong>Phone:</strong> {selectedWithdrawal.phone}</p>
                <p><strong>User Balance:</strong> {formatCurrency(selectedWithdrawal.profiles.wallet_balance)}</p>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes {actionType === 'reject' ? '(Required)' : '(Optional)'}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={actionType === 'approve' ? 'Add any notes...' : 'Reason for rejection...'}
                  required={actionType === 'reject'}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleWithdrawalAction(selectedWithdrawal.id, actionType, notes)}
                  disabled={actionLoading === selectedWithdrawal.id || (actionType === 'reject' && !notes.trim())}
                  className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={actionType === 'reject' ? 'destructive' : 'default'}
                >
                  {actionLoading === selectedWithdrawal.id ? 'Processing...' : 
                   actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsManagement;
