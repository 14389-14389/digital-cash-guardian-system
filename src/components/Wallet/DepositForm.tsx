
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

interface DepositFormProps {
  formData: {
    amount: string;
    phoneNumber: string;
  };
  onChange: (data: { amount: string; phoneNumber: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const DepositForm = ({ formData, onChange, onSubmit, loading }: DepositFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount (KES)</Label>
        <Input
          id="amount"
          type="number"
          min="10"
          value={formData.amount}
          onChange={(e) => onChange({ ...formData, amount: e.target.value })}
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
          onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
          placeholder="e.g., 0700000000"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        <Smartphone className="h-4 w-4 mr-2" />
        {loading ? 'Processing...' : `Pay KES ${formData.amount || '0'} via M-Pesa`}
      </Button>
    </form>
  );
};

export default DepositForm;
