
import { Button } from '@/components/ui/button';
import { Loader2, Smartphone, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentStatusProps {
  paymentStep: 'processing' | 'pin_prompt' | 'success' | 'failed';
  phoneNumber: string;
  amount: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

const PaymentStatus = ({ paymentStep, phoneNumber, amount, onCancel, onSuccess }: PaymentStatusProps) => {
  const [countdown, setCountdown] = useState(90); // 1.5 minutes timeout (faster)

  useEffect(() => {
    if (paymentStep === 'pin_prompt') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-center">
      {paymentStep === 'processing' && (
        <>
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-green-600" />
              <Shield className="h-6 w-6 absolute bottom-0 right-0 text-green-600 bg-white rounded-full p-1" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-green-600">Initiating Secure Payment</h3>
            <p className="text-sm text-gray-600">
              Connecting to Cashtele payment gateway...
            </p>
          </div>
        </>
      )}
      
      {paymentStep === 'pin_prompt' && (
        <>
          <div className="flex justify-center">
            <div className="relative">
              <Smartphone className="h-16 w-16 text-green-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-600">Check Your Phone!</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Cashtele Secure Payment</span>
              </div>
              <p className="text-sm text-green-800 font-medium">
                📱 Payment request sent to <strong>{phoneNumber}</strong>
              </p>
              <p className="text-sm text-green-700 mt-1">
                Enter your M-Pesa PIN on your phone to complete payment
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount:</strong> KES {parseInt(amount || '0').toLocaleString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Recipient:</strong> CASHTELLE INVESTMENT
              </p>
            </div>
            <div className="text-sm text-gray-600">
              ⏱️ Time remaining: <span className="font-mono font-bold text-green-600">{formatTime(countdown)}</span>
            </div>
            {countdown === 0 && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">Payment request has expired. Please try again.</p>
              </div>
            )}
          </div>
        </>
      )}

      {paymentStep === 'success' && (
        <>
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <Shield className="h-6 w-6 absolute bottom-0 right-0 text-green-600 bg-white rounded-full p-1" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-sm text-gray-600">
              KES {parseInt(amount || '0').toLocaleString()} has been added to your wallet
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Cashtele Payment Confirmed</span>
              </div>
              <p className="text-sm text-green-800">
                ✅ Payment verified from {phoneNumber}
              </p>
            </div>
          </div>
          {onSuccess && (
            <Button onClick={onSuccess} className="w-full bg-green-600 hover:bg-green-700">
              Continue to Investments
            </Button>
          )}
        </>
      )}

      {paymentStep === 'failed' && (
        <>
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
            <p className="text-sm text-gray-600">
              Payment was not completed. Please try again.
            </p>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                ❌ Transaction was cancelled or PIN was incorrect
              </p>
            </div>
          </div>
        </>
      )}
      
      <Button variant="outline" onClick={onCancel} className="w-full">
        {paymentStep === 'success' ? 'Close' : 'Cancel Payment'}
      </Button>
    </div>
  );
};

export default PaymentStatus;
