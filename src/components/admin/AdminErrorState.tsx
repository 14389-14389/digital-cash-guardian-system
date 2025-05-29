
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface AdminErrorStateProps {
  error: string;
  onRetry: () => void;
}

const AdminErrorState = ({ error, onRetry }: AdminErrorStateProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                onClick={onRetry} 
                variant="outline" 
                className="mt-2"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminErrorState;
