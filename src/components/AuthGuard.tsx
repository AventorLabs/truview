import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '../lib/auth';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        // Only log errors that are not the expected "Auth session missing!" message
        if (error?.message !== 'Auth session missing!') {
          console.error(error);
        }
      })
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default AuthGuard;