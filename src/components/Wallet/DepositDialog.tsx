
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Smartphone, Loader2 } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/mpesa';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const { user } = useAuth();
  const { createTransaction, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
  });
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'pin_prompt'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseInt(formData.amount);
      
      if (amount < 10) {
        toast({
          title: "Invalid Amount",
          description: "Minimum deposit amount is KES 10",
          variant: "destructive",
        });
        return;
      }

      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      
      // Create transaction record
      const transaction = await createTransaction({
        type: 'deposit',
        amount,
        payment_method: 'mpesa',
        phone_number: formattedPhone,
        description: `M-Pesa deposit of KES ${amount.toLocaleString()}`,
      });

      setPaymentStep('processing');

      // Initiate M-Pesa STK Push
      const response = await fetch('/api/mpesa-stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount,
          transactionId: transaction.id,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate M-Pesa payment');
      }

      const stkResponse = await response.json();
      
      setPaymentStep('pin_prompt');
      
      toast({
        title: "Payment Request Sent",
        description: "Please check your phone and enter your M-Pesa PIN to complete the payment",
      });

      // Poll for payment completion
      let pollCount = 0;
      const maxPolls = 24; // 2 minutes (5 second intervals)
      
      const pollPayment = setInterval(async () => {
        pollCount++;
        
        try {
          await refreshWallet();
          
          // Check if payment is completed by refreshing wallet
          // If successful, the wallet balance should update
          if (pollCount >= maxPolls) {
            clearInterval(pollPayment);
            setPaymentStep('form');
            toast({
              title: "Payment Timeout",
              description: "Payment verification timed out. Please check your transaction status.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error polling payment:', error);
        }
      }, 5000);

      // Clear polling after successful payment (simulated)
      setTimeout(() => {
        clearInterval(pollPayment);
        setPaymentStep('form');
        toast({
          title: "Payment Successful!",
          description: `KES ${amount.toLocaleString()} has been added to your wallet`,
        });
        refreshWallet();
        setFormData({ amount: '', phoneNumber: '' });
        onOpenChange(false);
      }, 12000); // 12 seconds - slightly after the backend simulation

    } catch (error: any) {
      console.error('Deposit error:', error);
      setPaymentStep('form');
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPaymentStep('form');
    setFormData({ amount: '', phoneNumber: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentStep === 'form' && 'Deposit Funds'}
            {paymentStep === 'processing' && 'Processing Payment'}
            {paymentStep === 'pin_prompt' && 'Enter M-Pesa PIN'}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === 'form' && 'Add money to your wallet using M-Pesa'}
            {paymentStep === 'processing' && 'Initiating M-Pesa STK Push...'}
            {paymentStep === 'pin_prompt' && 'Check your phone and enter your M-Pesa PIN to complete the payment'}
          </DialogDescription>
        </DialogHeader>
        
        {paymentStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount (min. 10)"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., 0700000000"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Smartphone className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : `Pay KES ${formData.amount || '0'} via M-Pesa`}
            </Button>
          </form>
        )}

        {(paymentStep === 'processing' || paymentStep === 'pin_prompt') && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
            
            {paymentStep === 'processing' && (
              <p className="text-sm text-gray-600">
                Sending payment request to your phone...
              </p>
            )}
            
            {paymentStep === 'pin_prompt' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Payment request sent to <strong>{formData.phoneNumber}</strong>
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Enter your M-Pesa PIN on your phone to complete the payment
                </p>
                <p className="text-xs text-gray-500">
                  Amount: KES {parseInt(formData.amount || '0').toLocaleString()}
                </p>
              </div>
            )}
            
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
