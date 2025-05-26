
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Smartphone, CreditCard, Building } from 'lucide-react';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const { user } = useAuth();
  const { createTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'mpesa',
    phoneNumber: '',
  });

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

      // Create transaction record
      const transaction = await createTransaction({
        type: 'deposit',
        amount,
        payment_method: formData.paymentMethod,
        phone_number: formData.phoneNumber,
        description: `Deposit via ${formData.paymentMethod.toUpperCase()}`,
      });

      // For now, we'll simulate the payment process
      // In production, this would initiate Pesapal payment
      toast({
        title: "Payment Initiated",
        description: "Please complete the payment on your mobile device",
      });

      // Simulate successful payment after 3 seconds (for demo)
      setTimeout(() => {
        toast({
          title: "Payment Successful",
          description: `KES ${amount.toLocaleString()} has been added to your wallet`,
        });
      }, 3000);

      setFormData({ amount: '', paymentMethod: 'mpesa', phoneNumber: '' });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet to start investing
          </DialogDescription>
        </DialogHeader>
        
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
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod === 'mpesa' && (
            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., 254700000000"
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processing...' : `Deposit KES ${formData.amount || '0'}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
