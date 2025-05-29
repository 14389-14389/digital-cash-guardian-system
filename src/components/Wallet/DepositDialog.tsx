
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { formatPhoneNumber } from '@/utils/mpesa';
import DepositForm from './DepositForm';
import PaymentStatus from './PaymentStatus';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Formatted phone number:', formattedPhone);
      
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
      console.log('Transaction created:', transaction.id);

      // Initiate M-Pesa STK Push via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: formattedPhone,
          amount,
          transactionId: transaction.id,
          userId: user?.id,
        },
      });

      if (error) {
        console.error('STK Push error:', error);
        throw new Error('Failed to initiate M-Pesa payment');
      }

      console.log('M-Pesa STK Push initiated:', data);

      // Move to PIN prompt stage
      setPaymentStep('pin_prompt');
      
      toast({
        title: "Payment Request Sent",
        description: `Check your phone ${formattedPhone} and enter your M-Pesa PIN to complete the payment`,
      });

      // Poll for payment completion
      const checkPaymentStatus = async () => {
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes (5 second intervals)
        
        const pollInterval = setInterval(async () => {
          attempts++;
          console.log(`Checking payment status... attempt ${attempts}`);
          
          try {
            const { data: transactionData, error: fetchError } = await supabase
              .from('transactions')
              .select('status, completed_at')
              .eq('id', transaction.id)
              .single();

            if (fetchError) {
              console.error('Error fetching transaction:', fetchError);
              return;
            }

            console.log('Transaction status:', transactionData.status);

            if (transactionData.status === 'completed') {
              clearInterval(pollInterval);
              setPaymentStep('success');
              
              toast({
                title: "Payment Successful!",
                description: `KES ${amount.toLocaleString()} has been added to your wallet`,
              });
              
              // Refresh wallet to show updated balance
              await refreshWallet();
              
            } else if (transactionData.status === 'failed') {
              clearInterval(pollInterval);
              setPaymentStep('failed');
              
              toast({
                title: "Payment Failed",
                description: "The payment could not be completed",
                variant: "destructive",
              });
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setPaymentStep('failed');
              
              toast({
                title: "Payment Timeout",
                description: "Payment request has expired. Please try again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 5000); // Check every 5 seconds
      };

      // Start polling for payment status
      checkPaymentStatus();

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
