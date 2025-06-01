
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
  type: 'starter' | 'growth' | 'premium' | 'elite';
  price: number;
  daily_earning: number;
  duration_days: number;
  features: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price');

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

    if (balance < packageData.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${formatCurrency(packageData.price)} to invest in this package`,
        variant: "destructive",
      });
      return;
    }

    setInvesting(packageData.id);

    try {
      const investmentAmount = packageData.price;
      const dailyEarning = packageData.daily_earning;

      // Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
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
            const dailyReturn = pkg.daily_earning;
            const totalReturn = dailyReturn * pkg.duration_days;
            const canInvest = balance >= pkg.price;

            return (
              <Card key={pkg.id} className={`relative overflow-hidden ${!canInvest ? 'opacity-60' : 'hover:shadow-lg'} transition-all`}>
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
                      `Invest ${formatCurrency(pkg.price)}`
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
