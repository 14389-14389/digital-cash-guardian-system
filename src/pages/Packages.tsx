
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Star, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';

interface Package {
  id: string;
  name: string;
  type: string;
  price: number;
  daily_earning: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const Packages = () => {
  const { user } = useAuth();
  const { balance, createTransaction, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestClick = (pkg: Package) => {
    if (balance < pkg.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${formatCurrency(pkg.price - balance)} more to invest in this package.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedPackage(pkg);
    setConfirmDialogOpen(true);
  };

  const handleConfirmInvestment = async () => {
    if (!selectedPackage || !user) return;
    
    setInvesting(true);

    try {
      // Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          package_id: selectedPackage.id,
          amount: selectedPackage.price,
          daily_earning: selectedPackage.daily_earning,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + selectedPackage.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Create transaction record for the investment
      await createTransaction({
        type: 'investment',
        amount: selectedPackage.price,
        description: `Investment in ${selectedPackage.name}`,
        related_investment_id: investment.id,
      });

      // Deduct from wallet balance immediately
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: balance - selectedPackage.price 
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Investment Successful!",
        description: `You've successfully invested ${formatCurrency(selectedPackage.price)} in ${selectedPackage.name}`,
      });

      setConfirmDialogOpen(false);
      setSelectedPackage(null);
      refreshWallet();
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInvesting(false);
    }
  };

  const getPackageColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'starter': return 'border-blue-200 bg-blue-50';
      case 'premium': return 'border-purple-200 bg-purple-50';
      case 'professional': return 'border-green-200 bg-green-50';
      case 'enterprise': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPackageBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateROI = (price: number, dailyEarning: number, duration: number) => {
    const totalEarning = dailyEarning * duration;
    return ((totalEarning - price) / price) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded mt-4"></div>
                </div>
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
          <p className="text-gray-600 mt-2">Choose a package that fits your investment goals</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">
          <Wallet className="h-5 w-5" />
          <span className="font-medium">Balance: {formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const roi = calculateROI(pkg.price, pkg.daily_earning, pkg.duration_days);
          const totalReturn = pkg.daily_earning * pkg.duration_days;
          const canAfford = balance >= pkg.price;

          return (
            <Card key={pkg.id} className={`relative ${getPackageColor(pkg.type)} transition-all hover:shadow-lg`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <Badge className={getPackageBadgeColor(pkg.type)}>
                    {pkg.type}
                  </Badge>
                </div>
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pkg.price)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Daily: {formatCurrency(pkg.daily_earning)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{pkg.duration_days} days</span>
                  </div>
                </div>

                <div className="bg-white/50 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Return</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalReturn)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="font-bold text-green-600">+{roi.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleInvestClick(pkg)}
                  disabled={!canAfford}
                  className={`w-full ${canAfford ? '' : 'opacity-50'}`}
                >
                  {canAfford ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Invest Now
                    </>
                  ) : (
                    'Insufficient Balance'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Investment Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Investment</DialogTitle>
            <DialogDescription>
              Review your investment details before proceeding
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{selectedPackage.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Investment Amount:</span>
                    <p className="font-bold">{formatCurrency(selectedPackage.price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Daily Earning:</span>
                    <p className="font-bold text-green-600">{formatCurrency(selectedPackage.daily_earning)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-bold">{selectedPackage.duration_days} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Return:</span>
                    <p className="font-bold text-green-600">
                      {formatCurrency(selectedPackage.daily_earning * selectedPackage.duration_days)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="font-bold">{formatCurrency(balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>After Investment:</span>
                  <span className="font-bold">{formatCurrency(balance - selectedPackage.price)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setConfirmDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmInvestment}
                  disabled={investing}
                  className="flex-1"
                >
                  {investing ? 'Processing...' : 'Confirm Investment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
