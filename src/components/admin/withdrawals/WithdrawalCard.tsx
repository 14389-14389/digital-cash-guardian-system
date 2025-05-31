
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/cashtele';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import WithdrawalStatusBadge from './WithdrawalStatusBadge';
import WithdrawalActions from './WithdrawalActions';

interface WithdrawalCardProps {
  withdrawal: {
    id: string;
    amount: number;
    phone_number?: string;
    status: string;
    created_at: string;
    processed_at?: string;
    admin_notes?: string;
    profiles: {
      full_name?: string;
      email: string;
    };
  };
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const WithdrawalCard = ({ withdrawal, onApprove, onReject }: WithdrawalCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {withdrawal.profiles.full_name || 'No Name'}
              </h3>
              <p className="text-sm text-gray-600">{withdrawal.profiles.email}</p>
            </div>
          </div>
          <WithdrawalStatusBadge status={withdrawal.status} />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-lg text-red-600">
              -{formatCurrency(withdrawal.amount)}
            </span>
          </div>

          {withdrawal.phone_number && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{withdrawal.phone_number}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Requested {formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })}
            </span>
          </div>

          {withdrawal.processed_at && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Processed {formatDistanceToNow(new Date(withdrawal.processed_at), { addSuffix: true })}
              </span>
            </div>
          )}

          {withdrawal.admin_notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Admin Notes:</strong> {withdrawal.admin_notes}
              </p>
            </div>
          )}
        </div>

        {withdrawal.status === 'pending' && (
          <WithdrawalActions
            withdrawalId={withdrawal.id}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalCard;
