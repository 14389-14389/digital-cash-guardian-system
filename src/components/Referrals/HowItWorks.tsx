
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share, UserPlus, DollarSign } from 'lucide-react';

const HowItWorks = () => {
  return (
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
            <p className="text-sm text-gray-600">Share your unique referral code with friends and family via WhatsApp</p>
          </div>
          <div className="text-center p-4">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">2. Friend Joins</h3>
            <p className="text-sm text-gray-600">They sign up and make their first investment using your code</p>
          </div>
          <div className="text-center p-4">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">3. You Earn</h3>
            <p className="text-sm text-gray-600">Get 10% commission on their investment amount instantly</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorks;
