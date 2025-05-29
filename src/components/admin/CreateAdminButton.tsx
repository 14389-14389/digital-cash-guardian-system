
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CreateAdminButton = () => {
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    mpesa: string;
  } | null>(null);
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
        setCredentials(data.credentials);
        toast({
          title: "Admin Created Successfully!",
          description: "Admin credentials have been generated and saved to the database.",
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

  const goToLogin = () => {
    window.location.href = '/auth';
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
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Admin Created Successfully!</h3>
              </div>
              {credentials && (
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="font-mono">{credentials.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Password:</span>
                    <span className="font-mono">{credentials.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">M-Pesa:</span>
                    <span className="font-mono">{credentials.mpesa}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Important:</p>
                  <p>Save these credentials securely. You can now use them to log in as an administrator.</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={goToLogin}
              className="w-full"
            >
              Go to Login Page
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateAdminButton;
