
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Users, Copy, Share, DollarSign, UserPlus } from 'lucide-react';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  created_at: string;
  referral_code: string;
}

const Referrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (user) {
      generateReferralCode();
      fetchReferrals();
    }
  }, [user]);

  const generateReferralCode = () => {
    if (user) {
      // Generate a simple referral code based on user ID
      const code = `REF${user.id.slice(-8).toUpperCase()}`;
      setReferralCode(code);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Cash-telle',
        text: 'Start earning with Cash-telle investment platform!',
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalEarned = referrals.reduce((sum, ref) => sum + ref.bonus_amount, 0);
  const totalReferrals = referrals.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-600 mt-2">Invite friends and earn commissions</p>
      </div>

      {/* Referral Code Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share className="h-5 w-5" />
            <span>Your Referral Code</span>
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn 10% commission on their first investment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-lg font-bold bg-white"
            />
            <Button onClick={copyReferralCode} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={shareReferralLink} className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</div>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Share className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Code</h3>
              <p className="text-sm text-gray-600">Share your unique referral code with friends and family</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Friend Joins</h3>
              <p className="text-sm text-gray-600">They sign up and make their first investment</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. You Earn</h3>
              <p className="text-sm text-gray-600">Get 10% commission on their investment amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Referrals</h2>
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-600">Start sharing your referral code to earn commissions!</p>
            </CardContent>
          </Card>
        ) : (
          referrals.map((referral) => (
            <Card key={referral.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Referral Bonus</CardTitle>
                    <CardDescription>
                      Earned {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {formatCurrency(referral.bonus_amount)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>Referral Code Used: <span className="font-mono font-bold">{referral.referral_code}</span></p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Referrals;
