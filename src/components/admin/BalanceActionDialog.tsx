
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/cashtele';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BalanceActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    wallet_balance: number;
  };
  action: 'add' | 'deduct';
  onSuccess: () => void;
}

const BalanceActionDialog = ({ open, onOpenChange, user, action, onSuccess }: BalanceActionDialogProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const newBalance = action === 'add' 
        ? user.wallet_balance + amountValue 
        : user.wallet_balance - amountValue;

      if (newBalance < 0) {
        throw new Error('Cannot deduct more than current balance');
      }

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: action === 'add' ? 'deposit' : 'withdrawal',
          amount: amountValue,
          status: 'completed',
          payment_method: 'admin_adjustment',
          description: `Admin ${action}: ${reason || 'Manual adjustment'}`,
          completed_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Balance Updated",
        description: `Successfully ${action === 'add' ? 'added' : 'deducted'} ${formatCurrency(amountValue)}`,
      });

      onSuccess();
      onOpenChange(false);
      setAmount('');
      setReason('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'add' ? 'Add Funds' : 'Deduct Funds'} - {user.email}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Current Balance</Label>
            <div className="text-lg font-semibold">{formatCurrency(user.wallet_balance)}</div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment"
              required
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : `${action === 'add' ? 'Add' : 'Deduct'} Funds`}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceActionDialog;
