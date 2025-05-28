
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/pesapal';
import { Plus, Minus } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  wallet_balance: number;
  role: string;
  created_at: string;
  phone: string;
}

interface UserCardProps {
  user: UserProfile;
  onAddMoney: (user: UserProfile) => void;
  onWithdrawMoney: (user: UserProfile) => void;
}

const UserCard = ({ user, onAddMoney, onWithdrawMoney }: UserCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
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
            onClick={() => onAddMoney(user)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWithdrawMoney(user)}
          >
            <Minus className="h-4 w-4 mr-1" />
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
