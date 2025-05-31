
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/utils/cashtele';

interface WalletCardProps {
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const WalletCard = ({ balance, onDeposit, onWithdraw }: WalletCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">Wallet Balance</CardTitle>
        <Wallet className="h-4 w-4 opacity-90" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
        <div className="flex space-x-2">
          <Button 
            onClick={onDeposit}
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Deposit
          </Button>
          <Button 
            onClick={onWithdraw}
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
