
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/pesapal';

interface UserProfile {
  id: string;
  full_name: string;
  wallet_balance: number;
  role: string;
  created_at: string;
  phone: string;
}

interface BalanceActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserProfile | null;
  actionType: 'add' | 'withdraw';
  onConfirm: (amount: string) => void;
}

const BalanceActionDialog = ({ 
  open, 
  onOpenChange, 
  selectedUser, 
  actionType, 
  onConfirm 
}: BalanceActionDialogProps) => {
  const [actionAmount, setActionAmount] = useState('');

  const handleConfirm = () => {
    onConfirm(actionAmount);
    setActionAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onClick={handleConfirm}
              className="flex-1"
              disabled={!actionAmount}
            >
              {actionType === 'add' ? 'Add Money' : 'Withdraw Money'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceActionDialog;
