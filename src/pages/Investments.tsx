
import { useInvestments } from '@/hooks/useInvestments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, Package, DollarSign, Calendar, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/cashtele';

const Investments = () => {
  const { investments, stats, loading } = useInvestments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (daysCompleted: number, totalDays: number) => {
    return (daysCompleted / totalDays) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
        <p className="text-gray-600 mt-2">Track your investment portfolio and earnings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarned)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeInvestments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Earning</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.dailyEarning)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        {investments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
              <p className="text-gray-600 mb-4">Start investing in packages to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => {
            const progress = calculateProgress(investment.days_completed, investment.packages.duration_days);
            const remainingDays = investment.packages.duration_days - investment.days_completed;
            
            return (
              <Card key={investment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{investment.packages.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Started {formatDistanceToNow(new Date(investment.start_date), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(investment.status)}>
                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Investment Amount</p>
                      <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Earning</p>
                      <p className="font-semibold text-green-600">{formatCurrency(investment.daily_earning)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Earned</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(investment.total_earned)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining Days</p>
                      <p className="font-semibold">{remainingDays} days</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{investment.days_completed}/{investment.packages.duration_days} days</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {investment.status === 'active' && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Next earning: {formatCurrency(investment.daily_earning)} in 24 hours
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Investments;
