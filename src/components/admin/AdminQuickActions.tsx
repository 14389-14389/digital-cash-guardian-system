
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common admin tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <button 
          onClick={() => window.location.href = '/dashboard/admin/users'}
          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
        >
          <div className="font-medium">Manage Users</div>
          <div className="text-sm text-gray-600">View and manage user accounts</div>
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard/admin/packages'}
          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border"
        >
          <div className="font-medium">Manage Packages</div>
          <div className="text-sm text-gray-600">Create and edit investment packages</div>
        </button>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
