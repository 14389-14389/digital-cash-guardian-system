
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Gift, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';

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

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'investment': return <Package className="h-4 w-4 text-blue-600" />;
      case 'commission': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'referral_bonus': return <Gift className="h-4 w-4 text-orange-600" />;
      default: return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColor = (type: string) => {
    return type === 'withdrawal' ? 'text-red-600' : 'text-green-600';
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'withdrawal' ? '-' : '+';
    return `${prefix}${formatCurrency(amount)}`;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Your transaction history will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getTransactionIcon(transaction.type)}
              <div>
                <p className="font-medium capitalize">
                  {transaction.description || transaction.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                </p>
                {transaction.payment_method && (
                  <p className="text-xs text-gray-500 capitalize">
                    via {transaction.payment_method.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </p>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
