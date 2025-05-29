
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import AdminSystemStatus from '@/components/admin/AdminSystemStatus';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import AdminErrorState from '@/components/admin/AdminErrorState';

const AdminDashboard = () => {
  const { isAdmin, user, profile, loading: authLoading } = useAuth();
  const { stats, loading, error, refetch } = useAdminStats(isAdmin);

  if (!isAdmin && !authLoading) {
    return (
      <AdminAccessDenied 
        userEmail={user?.email} 
        userRole={profile?.role} 
      />
    );
  }

  if (loading || authLoading) {
    return <AdminLoadingState />;
  }

  if (error) {
    return <AdminErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {profile?.full_name || user?.email} • Platform overview and statistics
        </p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminQuickActions />
        <AdminSystemStatus />
      </div>
    </div>
  );
};

export default AdminDashboard;
