
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentStatusProps {
  paymentStep: 'processing' | 'pin_prompt';
  phoneNumber: string;
  amount: string;
  onCancel: () => void;
}

const PaymentStatus = ({ paymentStep, phoneNumber, amount, onCancel }: PaymentStatusProps) => {
  return (
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
            Payment request sent to <strong>{phoneNumber}</strong>
          </p>
          <p className="text-sm text-green-600 font-medium">
            Enter your M-Pesa PIN on your phone to complete the payment
          </p>
          <p className="text-xs text-gray-500">
            Amount: KES {parseInt(amount || '0').toLocaleString()}
          </p>
        </div>
      )}
      
      <Button variant="outline" onClick={onCancel} className="w-full">
        Cancel Payment
      </Button>
    </div>
  );
};

export default PaymentStatus;
