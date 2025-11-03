  import React, { useState } from 'react';
  import { Navigate, Link, useNavigate } from 'react-router-dom';
  import { useAuth } from '../contexts/AuthContext';
  import { Button } from '../components/ui/button';
  import { Input } from '../components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
  import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
  import { useToast } from '../components/ui/toast';

  export default function Login() {
    const { user, login, loading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Demo accounts for easy access
    const demoAccounts = [
      { email: 'student@example.com', role: 'Student', org: 'Students', color: 'blue' },
      { email: 'employer@org1.com', role: 'Employer/Issuer', org: 'Org1MSP', color: 'purple' },
      { email: 'verifier@org2.com', role: 'University Verifier', org: 'Org2MSP', color: 'green' },
      { email: 'auditor@ministry.com', role: 'Ministry Auditor', org: 'Org3MSP', color: 'red' }
    ];

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (user) {
      if (user.email === 'student@example.com') {
        console.log('Redirecting to student dashboard');
        return <Navigate to="/dashboard/student" replace />;
      } else {
        console.log('Redirecting to student dashboard');
        return <Navigate to="/dashboard" replace />;
      }
    }
    

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        await login(email, password);
        toast({
          title: 'Welcome to BOSE!',
          description: 'Successfully logged in to the blockchain platform',
          variant: 'success'
        });
      } catch (error: any) {
        toast({
          title: 'Login Failed',
          description: error.response?.data?.error || 'Invalid credentials',
          variant: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleDemoLogin = (demoEmail: string) => {
      setEmail(demoEmail);
      setPassword('demo');
      // Optimistic redirect for student demo selection
      if (demoEmail === 'student@example.com') {
        // Do not navigate yet; user must click Sign In to actually auth.
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to landing */}
          <div className="mb-6">
            <Link to="/" className="text-blue-300 hover:text-blue-200 flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <Card className="bg-white/95 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">BOSE</h1>
                    <p className="text-sm text-gray-500">Blockchain Credentials</p>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to access the Hyperledger Fabric credential network
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="grid gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    onClick={() => handleDemoLogin(account.email)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{account.role}</div>
                      <div className="text-xs text-gray-500">{account.org}</div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="text-xs text-center text-gray-500">
                Demo accounts use password: <code className="bg-gray-100 px-1 rounded">demo</code>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-blue-200">
            Secured by Hyperledger Fabric • MSP Identity Management
          </div>
        </div>
      </div>
    );
  }