
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/cashtele';
import { useToast } from '@/hooks/use-toast';

interface FinancialData {
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  netFlow: number;
  depositsCount: number;
  withdrawalsCount: number;
}

const FinancialReports = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInvestments: 0,
    netFlow: 0,
    depositsCount: 0,
    withdrawalsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Fetch deposits
      const { data: deposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');

      // Fetch investments
      const { data: investments } = await supabase
        .from('user_investments')
        .select('amount');

      const totalDeposits = deposits?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalInvestments = investments?.reduce((sum, i) => sum + i.amount, 0) || 0;

      setFinancialData({
        totalDeposits,
        totalWithdrawals,
        totalInvestments,
        netFlow: totalDeposits - totalWithdrawals,
        depositsCount: deposits?.length || 0,
        withdrawalsCount: withdrawals?.length || 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = `
Financial Report
Generated: ${new Date().toLocaleDateString()}

Total Deposits: ${formatCurrency(financialData.totalDeposits)}
Total Withdrawals: ${formatCurrency(financialData.totalWithdrawals)}
Total Investments: ${formatCurrency(financialData.totalInvestments)}
Net Flow: ${formatCurrency(financialData.netFlow)}
Deposits Count: ${financialData.depositsCount}
Withdrawals Count: ${financialData.withdrawalsCount}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Financial Reports</span>
          </CardTitle>
          <Button onClick={exportReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Total Deposits</span>
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(financialData.totalDeposits)}
            </div>
            <div className="text-xs text-green-600">
              {financialData.depositsCount} transactions
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Total Withdrawals</span>
            </div>
            <div className="text-xl font-bold text-red-700">
              {formatCurrency(financialData.totalWithdrawals)}
            </div>
            <div className="text-xs text-red-600">
              {financialData.withdrawalsCount} transactions
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">Total Investments</span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(financialData.totalInvestments)}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${financialData.netFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-4 w-4 ${financialData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm ${financialData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net Flow
              </span>
            </div>
            <div className={`text-xl font-bold ${financialData.netFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(financialData.netFlow)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;
