
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { formatPhoneNumber } from '@/utils/mpesa';
import DepositForm from './DepositForm';
import PaymentStatus from './PaymentStatus';

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
      
      const transaction = await createTransaction({
        type: 'deposit',
        amount,
        payment_method: 'mpesa',
        phone_number: formattedPhone,
        description: `M-Pesa deposit of KES ${amount.toLocaleString()}`,
      });

      setPaymentStep('processing');

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

      setPaymentStep('pin_prompt');
      
      toast({
        title: "Payment Request Sent",
        description: "Please check your phone and enter your M-Pesa PIN to complete the payment",
      });

      // Simulate payment completion
      setTimeout(() => {
        setPaymentStep('form');
        toast({
          title: "Payment Successful!",
          description: `KES ${amount.toLocaleString()} has been added to your wallet`,
        });
        refreshWallet();
        setFormData({ amount: '', phoneNumber: '' });
        onOpenChange(false);
      }, 12000);

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
          <DepositForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {(paymentStep === 'processing' || paymentStep === 'pin_prompt') && (
          <PaymentStatus
            paymentStep={paymentStep}
            phoneNumber={formData.phoneNumber}
            amount={formData.amount}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
