import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './client';

interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
  role?: 'admin' | 'faculty' | 'student'|'alumni';
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  setUser: (user: User | null) => void; // ✅ ADDED
  setSession: (session: Session | null) => void; // ✅ ADDED
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔍 [AUTH] Checking stored auth...');
        console.log('🔍 [AUTH] Has token:', !!token);
        console.log('🔍 [AUTH] Has userData:', !!userData);

        // Only auto-login if BOTH token AND userData exist
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('✅ [AUTH] Auto-login with user:', parsedUser.email, 'Role:', parsedUser.role);
            setUser(parsedUser);
            setSession({ user: parsedUser });
          } catch (parseError) {
            console.error('❌ [AUTH] Error parsing user data:', parseError);
            // If parse fails, clear everything
            localStorage.clear();
            setUser(null);
            setSession(null);
          }
        } else {
          console.log('❌ [AUTH] No stored auth - staying logged out');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('❌ [AUTH] Error in checkAuth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
        console.log('✅ [AUTH] Loading complete');
      }
    };

    checkAuth();
  }, []); // Run only once on mount

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Attempting login for:', email);
      const { data } = await apiClient.post('/auth/login', { email, password });
      console.log('✅ [AUTH] Login successful:', data.user);

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setUser(data.user);
      setSession({ user: data.user });

      return { error: null };
    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error);
      return { error: error.response?.data?.error || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'student') => {
    try {
      console.log('📝 [AUTH] Attempting signup:', { email, fullName, role });
      const { data } = await apiClient.post('/auth/register', {
        email,
        password,
        fullName,
        role
      });
      console.log('✅ [AUTH] Signup successful:', data.user);

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setUser(data.user);
      setSession({ user: data.user });

      return { error: null };
    } catch (error: any) {
      console.error('❌ [AUTH] Signup error:', error);
      return { error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const signOut = async () => {
    console.log('🚪 [AUTH] Starting logout...');

    // FIRST: Clear React state immediately
    setUser(null);
    setSession(null);

    // SECOND: Clear localStorage items individually
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      console.log('✅ [AUTH] Storage cleared');
      console.log('🔍 [AUTH] Verifying - token:', localStorage.getItem('token'));
      console.log('🔍 [AUTH] Verifying - user:', localStorage.getItem('user'));
    } catch (error) {
      console.error('❌ [AUTH] Error clearing storage:', error);
    }

    // THIRD: Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));

    // FOURTH: Force hard reload to login page (bypass React Router cache)
    console.log('🔄 [AUTH] Redirecting to login...');
    window.location.replace('/login');
  };

  // Debug log on every render
  console.log('🔄 [AUTH] Current state - User:', user?.email || 'null', 'Role:', user?.role || 'null', 'Loading:', loading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      loading,
      setUser,      // ✅ ADDED
      setSession    // ✅ ADDED
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
