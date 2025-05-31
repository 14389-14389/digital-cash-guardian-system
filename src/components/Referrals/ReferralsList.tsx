
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/utils/cashtele';

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
  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
          <p className="text-gray-600">Share your referral code to start earning commissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="h-5 w-5" />
          <span>Referral History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {referrals.map((referral) => (
          <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">Referral Bonus</p>
                <p className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                </p>
                <p className="text-xs text-gray-500">Code: {referral.referral_code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">
                +{formatCurrency(referral.bonus_amount)}
              </p>
              <Badge className="bg-green-100 text-green-800">
                Completed
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReferralsList;
