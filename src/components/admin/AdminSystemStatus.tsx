
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Platform health overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">System Status</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Operational</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment Gateway</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystemStatus;
