
import { Shield } from 'lucide-react';

interface AdminAccessDeniedProps {
  userEmail?: string;
  userRole?: string;
}

const AdminAccessDenied = ({ userEmail, userRole }: AdminAccessDeniedProps) => {
  return (
    <div className="text-center py-12">
      <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <div className="text-sm text-gray-500">
        <p>Current user: {userEmail || 'Not logged in'}</p>
        <p>Profile role: {userRole || 'None'}</p>
      </div>
    </div>
  );
};

export default AdminAccessDenied;
