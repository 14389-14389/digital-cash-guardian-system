
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import WithdrawalCard from '@/components/admin/withdrawals/WithdrawalCard';
import { useWithdrawals } from '@/hooks/useWithdrawals';

const WithdrawalsManagement = () => {
  const { withdrawals, loading, processingId, processWithdrawal } = useWithdrawals();
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const handleProcessWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    const adminNotes = notes[withdrawalId] || '';
    await processWithdrawal(withdrawalId, action, adminNotes);
    setNotes(prev => ({ ...prev, [withdrawalId]: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
        <p className="text-gray-600 mt-2">Review and process withdrawal requests</p>
      </div>

      <div className="grid gap-4">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No withdrawal requests found</p>
            </CardContent>
          </Card>
        ) : (
          withdrawals.map((withdrawal) => (
            <WithdrawalCard
              key={withdrawal.id}
              withdrawal={withdrawal}
              notes={notes[withdrawal.id] || ''}
              onNotesChange={(value) => setNotes(prev => ({ ...prev, [withdrawal.id]: value }))}
              onProcessWithdrawal={(action) => handleProcessWithdrawal(withdrawal.id, action)}
              processing={processingId === withdrawal.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WithdrawalsManagement;
