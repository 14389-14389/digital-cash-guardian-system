
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, Copy, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralCodeCardProps {
  referralCode: string;
}

const ReferralCodeCard = ({ referralCode }: ReferralCodeCardProps) => {
  const { toast } = useToast();

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

  return (
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
          <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Share via WhatsApp
          </Button>
          <Button onClick={shareReferralLink} variant="outline" className="flex-1">
            <Share className="h-4 w-4 mr-2" />
            Share Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCodeCard;
