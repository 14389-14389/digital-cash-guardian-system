
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/cashtele';
import { InvestmentPackage } from './PackageInterface';

interface PackageCardProps {
  pkg: InvestmentPackage;
  balance: number;
  investing: string | null;
  onInvest: (packageData: InvestmentPackage) => void;
}

const PackageCard = ({ pkg, balance, investing, onInvest }: PackageCardProps) => {
  const dailyReturn = pkg.daily_earning;
  const totalReturn = dailyReturn * pkg.duration_days;
  const canInvest = balance >= pkg.price;

  return (
    <Card className={`relative overflow-hidden ${!canInvest ? 'opacity-60' : 'hover:shadow-lg'} transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{pkg.name}</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">
            {pkg.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600">Investment</span>
            </div>
            <div className="font-semibold text-blue-700">
              {formatCurrency(pkg.price)}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">Daily Return</span>
            </div>
            <div className="font-semibold text-green-700">
              {formatCurrency(dailyReturn)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">Duration:</span>
            </div>
            <span className="font-semibold text-orange-600">
              {pkg.duration_days} days
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="text-gray-600">Total Return:</span>
            </div>
            <span className="font-semibold text-indigo-600">
              {formatCurrency(totalReturn)}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Expected Total</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(pkg.price + totalReturn)}
            </div>
            <div className="text-xs text-gray-500">
              ({((totalReturn / pkg.price) * 100).toFixed(1)}% profit)
            </div>
          </div>
        </div>

        <Button
          onClick={() => onInvest(pkg)}
          disabled={!canInvest || investing === pkg.id}
          className="w-full"
          size="lg"
        >
          {investing === pkg.id ? (
            'Processing...'
          ) : !canInvest ? (
            'Insufficient Balance'
          ) : (
            `Invest ${formatCurrency(pkg.price)}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
