
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/cashtele';
import { Package, TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';

interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  daily_return_rate: number;
  duration_days: number;
  risk_level: string;
  is_active: boolean;
}

const Packages = () => {
  const { user } = useAuth();
  const { balance, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_packages')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load investment packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (packageData: InvestmentPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invest",
        variant: "destructive",
      });
      return;
    }

    if (balance < packageData.min_amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${formatCurrency(packageData.min_amount)} to invest in this package`,
        variant: "destructive",
      });
      return;
    }

    setInvesting(packageData.id);

    try {
      // Use minimum amount for investment
      const investmentAmount = packageData.min_amount;
      const dailyEarning = (investmentAmount * packageData.daily_return_rate) / 100;

      // Create investment record
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          package_id: packageData.id,
          amount: investmentAmount,
          daily_earning: dailyEarning,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        });

      if (investmentError) throw investmentError;

      // Deduct from wallet balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          wallet_balance: balance - investmentAmount
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: investmentAmount,
          status: 'completed',
          description: `Investment in ${packageData.name}`,
          completed_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      await refreshWallet();

      toast({
        title: "Investment Successful!",
        description: `You have successfully invested ${formatCurrency(investmentAmount)} in ${packageData.name}`,
      });

      // Redirect to investments page
      window.location.href = '/dashboard/investments';

    } catch (error: any) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to process investment",
        variant: "destructive",
      });
    } finally {
      setInvesting(null);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
          <p className="text-gray-600 mt-2">Choose from our carefully curated investment opportunities</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
        </div>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages available</h3>
            <p className="text-gray-600">Investment packages will appear here when available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const dailyReturn = (pkg.min_amount * pkg.daily_return_rate) / 100;
            const totalReturn = dailyReturn * pkg.duration_days;
            const canInvest = balance >= pkg.min_amount;

            return (
              <Card key={pkg.id} className={`relative overflow-hidden ${!canInvest ? 'opacity-60' : 'hover:shadow-lg'} transition-all`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <Badge className={getRiskColor(pkg.risk_level)}>
                      {pkg.risk_level} Risk
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600">Min Investment</span>
                      </div>
                      <div className="font-semibold text-blue-700">
                        {formatCurrency(pkg.min_amount)}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">Daily Return</span>
                      </div>
                      <div className="font-semibold text-green-700">
                        {pkg.daily_return_rate}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-600">Daily Earning:</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {formatCurrency(dailyReturn)}
                      </span>
                    </div>
                    
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
                        {formatCurrency(pkg.min_amount + totalReturn)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({((totalReturn / pkg.min_amount) * 100).toFixed(1)}% profit)
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleInvest(pkg)}
                    disabled={!canInvest || investing === pkg.id}
                    className="w-full"
                    size="lg"
                  >
                    {investing === pkg.id ? (
                      'Processing...'
                    ) : !canInvest ? (
                      'Insufficient Balance'
                    ) : (
                      `Invest ${formatCurrency(pkg.min_amount)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Packages;
