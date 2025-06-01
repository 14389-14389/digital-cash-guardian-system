
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserCard from '@/components/admin/UserCard';
import { UserProfile, UserCardData } from './UserProfileInterface';

interface UsersListProps {
  users: UserProfile[];
  onAddFunds: (user: UserProfile) => void;
  onDeductFunds: (user: UserProfile) => void;
}

const UsersList = ({ users, onAddFunds, onDeductFunds }: UsersListProps) => {
  const convertToUserCardData = (user: UserProfile): UserCardData => ({
    id: user.id,
    email: user.full_name || 'No Name',
    full_name: user.full_name,
    phone_number: user.phone,
    wallet_balance: user.wallet_balance,
    created_at: user.created_at,
    is_admin: user.role === 'admin'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>Manage user accounts and wallet balances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={convertToUserCardData(user)}
              onAddFunds={() => onAddFunds(user)}
              onDeductFunds={() => onDeductFunds(user)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
