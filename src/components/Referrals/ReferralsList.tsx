
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Users, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/pesapal';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus_amount: number;
  created_at: string;
  referral_code: string;
}

interface ReferralsListProps {
  referrals: Referral[];
  referralCode: string;
}

const ReferralsList = ({ referrals, referralCode }: ReferralsListProps) => {
  const { toast } = useToast();

  const shareViaWhatsApp = () => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    const message = `🚀 *Join Cash-telle Investment Platform!* 💰

Start earning daily returns on your investments with our secure platform.

✅ Daily earnings up to 10%
✅ Multiple investment packages
✅ Secure M-Pesa payments
✅ Real-time tracking
✅ Instant withdrawals

Use my referral code: *${referralCode}*

👇 Sign up now:
${referralLink}

#Investment #EarnDaily #CashTelle #Kenya`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened!",
      description: "Share your referral link via WhatsApp",
    });
  };

  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
          <p className="text-gray-600 mb-4">Start sharing your referral code via WhatsApp to earn commissions!</p>
          <Button onClick={shareViaWhatsApp} className="bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Share on WhatsApp
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
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
      ))}
    </div>
  );
};

export default ReferralsList;
