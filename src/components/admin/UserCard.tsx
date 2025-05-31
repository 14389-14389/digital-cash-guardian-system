
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/cashtele';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Wallet, Plus, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserCardProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    wallet_balance: number;
    created_at: string;
    is_admin: boolean;
  };
  onAddFunds: (user: any) => void;
  onDeductFunds: (user: any) => void;
}

const UserCard = ({ user, onAddFunds, onDeductFunds }: UserCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.full_name || 'No Name'}</h3>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>
          {user.is_admin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Admin
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Wallet Balance</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatCurrency(user.wallet_balance)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </span>
          </div>

          {user.phone_number && (
            <div className="text-sm text-gray-600">
              Phone: {user.phone_number}
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAddFunds(user)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Funds
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDeductFunds(user)}
            className="flex-1"
          >
            <Minus className="h-4 w-4 mr-1" />
            Deduct
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
