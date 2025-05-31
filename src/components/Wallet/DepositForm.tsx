
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Smartphone, Shield } from 'lucide-react';

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
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Powered by Cashtele</p>
        </div>
        <p className="text-xs text-green-700 mt-1">Fast, secure, and reliable M-Pesa payments</p>
      </div>

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
          className="text-lg"
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

      <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
        <Smartphone className="h-4 w-4 mr-2" />
        {loading ? 'Processing...' : `Pay KES ${formData.amount || '0'} via Cashtele`}
      </Button>
    </form>
  );
};

export default DepositForm;
