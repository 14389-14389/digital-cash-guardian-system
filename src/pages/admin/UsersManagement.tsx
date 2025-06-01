
import { useAuth } from '@/hooks/useAuth';
import UserStatsCards from '@/components/admin/UserStatsCards';
import BalanceActionDialog from '@/components/admin/BalanceActionDialog';
import UsersList from '@/components/admin/users/UsersList';
import UsersLoadingState from '@/components/admin/users/UsersLoadingState';
import UsersAccessDenied from '@/components/admin/users/UsersAccessDenied';
import { useUsersManagement } from '@/hooks/useUsersManagement';

const UsersManagement = () => {
  const { isAdmin } = useAuth();
  const {
    users,
    loading,
    selectedUser,
    actionType,
    dialogOpen,
    setDialogOpen,
    handleAddMoney,
    handleWithdrawMoney,
    calculateStats,
    fetchUsers
  } = useUsersManagement(isAdmin);

  if (!isAdmin) {
    return <UsersAccessDenied />;
  }

  if (loading) {
    return <UsersLoadingState />;
  }

  const stats = calculateStats();

  // Convert selected user for dialog and map action type to the dialog's expected prop
  const selectedUserForDialog = selectedUser ? {
    id: selectedUser.id,
    email: selectedUser.full_name || 'No Name',
    wallet_balance: selectedUser.wallet_balance
  } : null;

  const dialogAction = actionType === 'add' ? 'add' : 'deduct';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and balances</p>
      </div>

      <UserStatsCards stats={stats} />

      <UsersList 
        users={users}
        onAddFunds={handleAddMoney}
        onDeductFunds={handleWithdrawMoney}
      />

      {selectedUserForDialog && (
        <BalanceActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={selectedUserForDialog}
          action={dialogAction}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersManagement;
