
import { Shield } from 'lucide-react';

const UsersAccessDenied = () => {
  return (
    <div className="text-center py-12">
      <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  );
};

export default UsersAccessDenied;
