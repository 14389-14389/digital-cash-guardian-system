
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/pesapal';
import { Download, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface FinancialSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  totalCommissions: number;
  activeUsers: number;
  pendingWithdrawals: number;
}

interface TransactionWithProfile {
  id: string;
  type: string;
  amount: number;
  status: string;
  payment_method: string | null;
  reference_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const FinancialReports = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInvestments: 0,
    totalCommissions: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'last'>('current');

  useEffect(() => {
    fetchFinancialSummary();
  }, [selectedPeriod]);

  const fetchFinancialSummary = async () => {
    try {
      const now = new Date();
      const startDate = selectedPeriod === 'current' 
        ? startOfMonth(now) 
        : startOfMonth(subMonths(now, 1));
      const endDate = selectedPeriod === 'current' 
        ? endOfMonth(now) 
        : endOfMonth(subMonths(now, 1));

      // Get deposits
      const { data: deposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get withdrawals
      const { data: withdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get investments
      const { data: investments } = await supabase
        .from('investments')
        .select('amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get commissions
      const { data: commissions } = await supabase
        .from('transactions')
        .select('amount')
        .in('type', ['commission', 'referral_bonus'])
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get active users (users with transactions in period)
      const { data: activeUsers } = await supabase
        .from('transactions')
        .select('user_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'pending');

      const uniqueUsers = activeUsers ? [...new Set(activeUsers.map(t => t.user_id))].length : 0;

      setSummary({
        totalDeposits: deposits?.reduce((sum, d) => sum + d.amount, 0) || 0,
        totalWithdrawals: withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0,
        totalInvestments: investments?.reduce((sum, i) => sum + i.amount, 0) || 0,
        totalCommissions: commissions?.reduce((sum, c) => sum + c.amount, 0) || 0,
        activeUsers: uniqueUsers,
        pendingWithdrawals: pendingWithdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0,
      });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      toast({
        title: "Error",
        description: "Failed to load financial reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const now = new Date();
      const startDate = selectedPeriod === 'current' 
        ? startOfMonth(now) 
        : startOfMonth(subMonths(now, 1));
      const endDate = selectedPeriod === 'current' 
        ? endOfMonth(now) 
        : endOfMonth(subMonths(now, 1));

      // Get detailed transaction data with proper join
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          status,
          payment_method,
          reference_id,
          created_at,
          profiles(full_name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        toast({
          title: "No Data",
          description: "No transactions found for the selected period",
        });
        return;
      }

      // Create CSV content
      const headers = ['Date', 'User', 'Type', 'Amount', 'Status', 'Payment Method', 'Reference'];
      const csvContent = [
        headers.join(','),
        ...transactions.map((t: TransactionWithProfile) => [
          format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
          t.profiles?.full_name || 'Unknown',
          t.type,
          t.amount,
          t.status,
          t.payment_method || '',
          t.reference_id || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${format(startDate, 'yyyy-MM')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Financial report has been downloaded",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const netIncome = summary.totalDeposits + summary.totalInvestments - summary.totalWithdrawals - summary.totalCommissions;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <div>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>
              Financial overview for {selectedPeriod === 'current' ? 'current month' : 'last month'}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('current')}
            >
              Current Month
            </Button>
            <Button
              variant={selectedPeriod === 'last' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('last')}
            >
              Last Month
            </Button>
            <Button onClick={generateReport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Deposits</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalDeposits)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.totalWithdrawals)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Investments</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.totalInvestments)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Commissions</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(summary.totalCommissions)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-orange-700">{summary.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.pendingWithdrawals)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(netIncome)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Income - Outflow = {formatCurrency(summary.totalDeposits + summary.totalInvestments)} - {formatCurrency(summary.totalWithdrawals + summary.totalCommissions)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;
