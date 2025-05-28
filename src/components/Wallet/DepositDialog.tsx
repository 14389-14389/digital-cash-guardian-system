
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
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'pin_prompt' | 'success' | 'failed'>('form');
  const [transactionId, setTransactionId] = useState<string>('');

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
        setLoading(false);
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

      setTransactionId(transaction.id);
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

      const result = await response.json();
      console.log('M-Pesa STK Push initiated:', result);

      // Move to PIN prompt stage
      setPaymentStep('pin_prompt');
      
      toast({
        title: "Payment Request Sent",
        description: "Check your phone and enter your M-Pesa PIN to complete the payment",
      });

      // Simulate payment completion after 15 seconds (realistic PIN entry time)
      setTimeout(async () => {
        try {
          console.log('Simulating payment completion...');
          
          // In a real implementation, this would be handled by the webhook
          // For demo purposes, we'll simulate the success
          setPaymentStep('success');
          
          toast({
            title: "Payment Successful!",
            description: `KES ${amount.toLocaleString()} has been added to your wallet`,
          });
          
          // Refresh wallet to show updated balance
          await refreshWallet();
          
        } catch (error) {
          console.error('Payment completion error:', error);
          setPaymentStep('failed');
          toast({
            title: "Payment Failed",
            description: "There was an issue completing your payment",
            variant: "destructive",
          });
        }
      }, 15000); // 15 seconds for realistic PIN entry

    } catch (error: any) {
      console.error('Deposit error:', error);
      setPaymentStep('failed');
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
    setTransactionId('');
    onOpenChange(false);
  };

  const handleSuccess = () => {
    // Navigate to packages page after successful deposit
    window.location.href = '/dashboard/packages';
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (paymentStep) {
      case 'form': return 'Deposit Funds';
      case 'processing': return 'Processing Payment';
      case 'pin_prompt': return 'Enter M-Pesa PIN';
      case 'success': return 'Payment Successful';
      case 'failed': return 'Payment Failed';
      default: return 'Deposit Funds';
    }
  };

  const getDialogDescription = () => {
    switch (paymentStep) {
      case 'form': return 'Add money to your wallet using M-Pesa';
      case 'processing': return 'Initiating M-Pesa STK Push...';
      case 'pin_prompt': return 'Complete the payment on your mobile device';
      case 'success': return 'Your wallet has been updated successfully';
      case 'failed': return 'Payment could not be completed';
      default: return 'Add money to your wallet using M-Pesa';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        {paymentStep === 'form' && (
          <DepositForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {['processing', 'pin_prompt', 'success', 'failed'].includes(paymentStep) && (
          <PaymentStatus
            paymentStep={paymentStep as 'processing' | 'pin_prompt' | 'success' | 'failed'}
            phoneNumber={formData.phoneNumber}
            amount={formData.amount}
            onCancel={handleCancel}
            onSuccess={paymentStep === 'success' ? handleSuccess : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
