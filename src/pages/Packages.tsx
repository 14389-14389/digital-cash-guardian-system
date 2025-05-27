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

    if (balance < packageData.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to your wallet first",
        variant: "destructive",
      });
      return;
    }

    setInvesting(packageData.id);

    try {
      // Create investment record
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

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: -packageData.price,
          status: 'completed',
          payment_method: 'wallet',
          description: `Investment in ${packageData.name} package`,
          completed_at: new Date().toISOString(),
          related_investment_id: investment.id
        });

      if (transactionError) throw transactionError;

      // Refresh wallet to show updated balance
      await refreshWallet();

      toast({
        title: "Investment Successful!",
        description: `You have successfully invested in ${packageData.name}`,
      });

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

      {/* Wallet Balance Display */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard/wallet'} 
              variant="outline"
            >
              Deposit Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const Icon = getPackageIcon(pkg.type);
          const colorClass = getPackageColor(pkg.type);
          const canAfford = balance >= pkg.price;
          
          return (
            <Card key={pkg.id} className={`bg-gradient-to-br ${colorClass} border-2 transition-all hover:shadow-lg`}>
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

                <Button
                  onClick={() => handleInvest(pkg)}
                  disabled={!canAfford || investing === pkg.id}
                  className="w-full"
                >
                  {investing === pkg.id ? 'Processing...' : 
                   !canAfford ? 'Insufficient Balance' : 
                   'Invest Now'}
                </Button>

                {!canAfford && (
                  <p className="text-xs text-red-600 text-center">
                    Deposit {formatCurrency(pkg.price - balance)} more to invest
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Packages;
