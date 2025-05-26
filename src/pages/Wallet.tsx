
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import WalletCard from '@/components/Wallet/WalletCard';
import DepositDialog from '@/components/Wallet/DepositDialog';
import TransactionList from '@/components/Wallet/TransactionList';
import { Card, CardContent } from '@/components/ui/card';

const Wallet = () => {
  const { balance, transactions, loading } = useWallet();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  const handleWithdraw = () => {
    // Navigate to withdrawals page or open withdraw dialog
    window.location.href = '/dashboard/withdrawals';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <div className="grid grid-cols-1 gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your funds and view transaction history</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WalletCard 
          balance={balance}
          onDeposit={() => setDepositDialogOpen(true)}
          onWithdraw={handleWithdraw}
        />
        
        <TransactionList transactions={transactions} />
      </div>

      <DepositDialog 
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
      />
    </div>
  );
};

export default Wallet;
