
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReferralCodeCard from '@/components/Referrals/ReferralCodeCard';
import ReferralStats from '@/components/Referrals/ReferralStats';
import HowItWorks from '@/components/Referrals/HowItWorks';
import ReferralsList from '@/components/Referrals/ReferralsList';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
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

      <ReferralCodeCard referralCode={referralCode} />
      
      <ReferralStats totalReferrals={totalReferrals} totalEarned={totalEarned} />
      
      <HowItWorks />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Referrals</h2>
        <ReferralsList referrals={referrals} referralCode={referralCode} />
      </div>
    </div>
  );
};

export default Referrals;
