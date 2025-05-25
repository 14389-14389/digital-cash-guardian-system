
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, TrendingUp } from 'lucide-react';

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
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (packageData: Package) => {
    if (!user) return;

    setInvesting(packageData.id);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageData.duration_days);

      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          package_id: packageData.id,
          amount: packageData.price,
          daily_earning: packageData.daily_earning,
          end_date: endDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Investment Successful!",
        description: `You have successfully invested in ${packageData.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInvesting(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getPackageColor = (type: string) => {
    switch (type) {
      case 'starter': return 'bg-blue-50 border-blue-200';
      case 'growth': return 'bg-green-50 border-green-200';
      case 'premium': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'premium': return <Star className="h-5 w-5 text-purple-600" />;
      default: return <TrendingUp className="h-5 w-5 text-blue-600" />;
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
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
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
        <p className="text-gray-600 mt-2">Choose the perfect investment package for your financial goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`relative ${getPackageColor(pkg.type)} transition-all hover:shadow-lg`}>
            {pkg.type === 'premium' && (
              <Badge className="absolute -top-2 left-4 bg-purple-600">
                Most Popular
              </Badge>
            )}
            
            <CardHeader>
              <div className="flex items-center space-x-2">
                {getPackageIcon(pkg.type)}
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
              </div>
              <CardDescription className="text-2xl font-bold text-gray-900">
                {formatCurrency(pkg.price)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Earning:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(pkg.daily_earning)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Return:</span>
                  <span className="font-semibold">
                    {formatCurrency(pkg.daily_earning * pkg.duration_days)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROI:</span>
                  <span className="font-semibold text-blue-600">
                    {(((pkg.daily_earning * pkg.duration_days) / pkg.price - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Features:</h4>
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
                disabled={investing === pkg.id}
                className="w-full"
                size="lg"
              >
                {investing === pkg.id ? 'Processing...' : 'Invest Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Packages;
