
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/pesapal';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import WithdrawalStatusBadge from './WithdrawalStatusBadge';
import WithdrawalActions from './WithdrawalActions';

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

interface WithdrawalCardProps {
  withdrawal: Withdrawal;
  notes: string;
  onNotesChange: (value: string) => void;
  onProcessWithdrawal: (action: 'approve' | 'reject') => void;
  processing: boolean;
}

const WithdrawalCard = ({ 
  withdrawal, 
  notes, 
  onNotesChange, 
  onProcessWithdrawal, 
  processing 
}: WithdrawalCardProps) => {
  return (
    <Card>
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
          <WithdrawalStatusBadge status={withdrawal.status} />
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
          <WithdrawalActions
            withdrawalId={withdrawal.id}
            notes={notes}
            onNotesChange={onNotesChange}
            onApprove={() => onProcessWithdrawal('approve')}
            onReject={() => onProcessWithdrawal('reject')}
            processing={processing}
          />
        )}

        {withdrawal.processed_at && (
          <div className="text-sm text-gray-600">
            Processed on {format(new Date(withdrawal.processed_at), 'PPP')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalCard;
