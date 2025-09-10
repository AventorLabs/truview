import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Eye, MessageSquare, Layers, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '../lib/auth';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(console.error);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  // Hide navigation for client preview pages
  const isClientView = location.pathname === '/ar-client-preview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    TrueView AR
                  </h1>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">AventorLabs</p>
                </div>
              </div>
            </div>
            
            {/* Only show navigation if not in client view */}
            {!isClientView && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/"
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                    isActive('/') 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/browse"
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                    isActive('/browse') 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Browse</span>
                </Link>
                <Link
                  to="/feedback"
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                    isActive('/feedback') 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isClientView ? 'py-0' : 'py-8 sm:py-12'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;