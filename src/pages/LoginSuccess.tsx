import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setSession } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Extract token and user from URL query params
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        console.log('🔐 Google OAuth Callback - Token:', !!token);
        console.log('🔐 Google OAuth Callback - User:', userJson);

        if (!token || !userJson) {
          console.error('❌ Missing token or user data');
          navigate('/login', { replace: true });
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userJson));
        console.log('✅ Parsed user:', user);

        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update auth context
        setUser(user);
        setSession({ user });

        console.log('✅ Google login successful! Redirecting to dashboard...');

        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          navigate(`/${user.role}/dashboard`, { replace: true });
        }, 500);

      } catch (error) {
        console.error('❌ Error handling Google callback:', error);
        navigate('/login', { replace: true });
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, setUser, setSession]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600">Please wait while we log you in</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
