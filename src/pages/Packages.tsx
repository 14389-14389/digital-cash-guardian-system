import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, TrendingUp, Shield, Crown, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';

interface Package {
  id: string;
  name: string;
  type: 'starter' | 'growth' | 'premium' | 'elite';
  price: number;
  daily_earning: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const Packages = () => {
  const { user } = useAuth();
  const { balance, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
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
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our Package interface
      const transformedPackages = data?.map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features as string[] : 
                 typeof pkg.features === 'string' ? [pkg.features] : []
      })) || [];
      
      setPackages(transformedPackages);
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

  const handleInvest = async (packageData: Package) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to invest",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    if (balance < packageData.price) {
      const shortfall = packageData.price - balance;
      toast({
        title: "Insufficient Balance",
        description: `You need KES ${shortfall.toLocaleString()} more to invest in this package. Please deposit funds first.`,
        variant: "destructive",
      });
      
      // Show deposit prompt
      setTimeout(() => {
        toast({
          title: "💡 Tip",
          description: "Use the Deposit button to add funds to your wallet via M-Pesa",
        });
      }, 2000);
      
      return;
    }

    setInvesting(packageData.id);

    try {
      console.log(`Starting investment process for package ${packageData.name}`);
      console.log(`User balance: KES ${balance}, Package price: KES ${packageData.price}`);

      // Create investment record first
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          package_id: packageData.id,
          amount: packageData.price,
          daily_earning: packageData.daily_earning,
          status: 'active',
          days_completed: 0,
          total_earned: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      console.log('Investment created:', investment.id);

      // Create transaction record for the investment
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: -packageData.price, // Negative amount for deduction
          status: 'completed',
          payment_method: 'wallet',
          description: `Investment in ${packageData.name} package`,
          completed_at: new Date().toISOString(),
          related_investment_id: investment.id,
          metadata: {
            package_name: packageData.name,
            package_type: packageData.type,
            daily_earning: packageData.daily_earning,
            duration_days: packageData.duration_days,
            investment_start: new Date().toISOString()
          }
        });

      if (transactionError) throw transactionError;

      console.log('Investment transaction created');

      // Update wallet balance by deducting the investment amount
      const newBalance = balance - packageData.price;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          wallet_balance: newBalance
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      console.log(`Wallet balance updated: ${balance} -> ${newBalance}`);

      // Refresh wallet to show updated balance
      await refreshWallet();

      toast({
        title: "🚀 Investment Successful!",
        description: `You have successfully invested KES ${packageData.price.toLocaleString()} in ${packageData.name}`,
      });

      // Show investment details
      setTimeout(() => {
        toast({
          title: "📈 Investment Details",
          description: `Daily earning: KES ${packageData.daily_earning.toLocaleString()} for ${packageData.duration_days} days. Total expected return: KES ${(packageData.daily_earning * packageData.duration_days).toLocaleString()}`,
        });
      }, 2000);

      // Navigate to investments page to see the new investment
      setTimeout(() => {
        window.location.href = '/dashboard/investments';
      }, 4000);

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

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'starter': return TrendingUp;
      case 'growth': return Shield;
      case 'premium': return Crown;
      case 'elite': return Zap;
      default: return TrendingUp;
    }
  };

  const getPackageColor = (type: string) => {
    switch (type) {
      case 'starter': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'growth': return 'from-green-50 to-green-100 border-green-200';
      case 'premium': return 'from-purple-50 to-purple-100 border-purple-200';
      case 'elite': return 'from-orange-50 to-orange-100 border-orange-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
        <p className="text-gray-600 mt-2">Choose an investment package that suits your goals</p>
      </div>

      {/* Enhanced Wallet Balance Display */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">💰 Available Balance</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(balance)}</p>
              <p className="text-sm text-green-700 mt-1">
                ✅ Ready to invest • Funds available for immediate investment
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard/wallet'} 
              variant="outline"
              className="bg-white hover:bg-gray-50 border-green-300 text-green-700"
            >
              📱 Add Funds via M-Pesa
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const Icon = getPackageIcon(pkg.type);
          const colorClass = getPackageColor(pkg.type);
          const canAfford = balance >= pkg.price;
          const shortfall = pkg.price - balance;
          
          return (
            <Card key={pkg.id} className={`bg-gradient-to-br ${colorClass} border-2 transition-all hover:shadow-lg ${!canAfford ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-6 w-6" />
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {pkg.type}
                  </Badge>
                </div>
                <CardDescription>
                  {pkg.duration_days} days investment plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Daily earnings: <span className="font-semibold text-green-600">{formatCurrency(pkg.daily_earning)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total return: <span className="font-semibold text-blue-600">
                      {formatCurrency(pkg.daily_earning * pkg.duration_days)}
                    </span>
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    ROI: {(((pkg.daily_earning * pkg.duration_days - pkg.price) / pkg.price) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!canAfford && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-800 text-center font-medium">
                      ⚠️ <strong>Insufficient Balance:</strong> You need {formatCurrency(shortfall)} more
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/dashboard/wallet'}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      📱 Deposit {formatCurrency(shortfall)} via M-Pesa
                    </Button>
                  </div>
                )}

                {canAfford && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-800 text-center font-medium">
                      ✅ <strong>Ready to Invest:</strong> You have sufficient balance
                    </p>
                    <p className="text-xs text-green-700 text-center mt-1">
                      Remaining after investment: {formatCurrency(balance - pkg.price)}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleInvest(pkg)}
                  disabled={!canAfford || investing === pkg.id}
                  className={`w-full ${canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {investing === pkg.id ? '⏳ Processing Investment...' : 
                   !canAfford ? `💰 Deposit ${formatCurrency(shortfall)} First` : 
                   '🚀 Invest Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Packages;
