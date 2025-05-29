
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/pesapal';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

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

const WithdrawalsManagement = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchWithdrawals();
  }, []);

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

  const processWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setProcessingId(withdrawalId);
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      const adminNotes = notes[withdrawalId] || '';

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
      setNotes(prev => ({ ...prev, [withdrawalId]: '' }));

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
        <p className="text-gray-600 mt-2">Review and process withdrawal requests</p>
      </div>

      <div className="grid gap-4">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No withdrawal requests found</p>
            </CardContent>
          </Card>
        ) : (
          withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">
                        {withdrawal.full_name || 'Unknown User'}
                      </CardTitle>
                      <CardDescription>
                        Requested on {format(new Date(withdrawal.requested_at), 'PPP')}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-lg font-semibold">{withdrawal.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(withdrawal.wallet_balance)}
                    </p>
                  </div>
                </div>

                {withdrawal.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Admin Notes:</p>
                    <p className="text-sm">{withdrawal.notes}</p>
                  </div>
                )}

                {withdrawal.status === 'pending' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Add Notes (Optional)</label>
                      <Textarea
                        value={notes[withdrawal.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [withdrawal.id]: e.target.value }))}
                        placeholder="Add any notes about this withdrawal..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => processWithdrawal(withdrawal.id, 'approve')}
                        disabled={processingId === withdrawal.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processingId === withdrawal.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => processWithdrawal(withdrawal.id, 'reject')}
                        disabled={processingId === withdrawal.id}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processingId === withdrawal.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}

                {withdrawal.processed_at && (
                  <div className="text-sm text-gray-600">
                    Processed on {format(new Date(withdrawal.processed_at), 'PPP')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WithdrawalsManagement;
