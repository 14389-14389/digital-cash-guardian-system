
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle } from 'lucide-react';

interface WithdrawalActionsProps {
  withdrawalId: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}

const WithdrawalActions = ({ 
  withdrawalId, 
  notes, 
  onNotesChange, 
  onApprove, 
  onReject, 
  processing 
}: WithdrawalActionsProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Add Notes (Optional)</label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes about this withdrawal..."
          className="mt-1"
        />
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onApprove}
          disabled={processing}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {processing ? 'Processing...' : 'Approve'}
        </Button>
        <Button
          onClick={onReject}
          disabled={processing}
          variant="destructive"
        >
          <XCircle className="h-4 w-4 mr-2" />
          {processing ? 'Processing...' : 'Reject'}
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalActions;
