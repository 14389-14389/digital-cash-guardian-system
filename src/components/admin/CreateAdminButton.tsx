
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CreateAdminButton = () => {
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const { toast } = useToast();

  const createAdmin = async () => {
    setLoading(true);
    try {
      console.log('Calling create-admin function via Supabase...');
      
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {}
      });

      console.log('Function response:', data);
      console.log('Function error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to invoke function');
      }

      if (data && data.success) {
        setAdminCreated(true);
        toast({
          title: "Admin Created Successfully!",
          description: "You can now log in with the admin credentials.",
        });
      } else {
        throw new Error(data?.error || 'Failed to create admin');
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Setup Admin Account</CardTitle>
        <CardDescription>
          Create admin login credentials for Cash-telle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!adminCreated ? (
          <Button 
            onClick={createAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Admin...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Generate Admin Credentials
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Admin Created Successfully!</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Email:</strong> kevinkisaa@gmail.com</p>
                <p><strong>Password:</strong> Alfaromeo001@</p>
                <p><strong>M-Pesa Account:</strong> 0743455893</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateAdminButton;
