
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface WithdrawalStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const WithdrawalStatusBadge = ({ status }: WithdrawalStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    case 'completed':
      return <Badge variant="outline" className="text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default WithdrawalStatusBadge;
