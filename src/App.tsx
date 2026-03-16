import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import { auth } from './firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'upload' | 'profile'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return view === 'register' ? (
      <Register onSwitch={() => setView('login')} />
    ) : (
      <Login onSwitch={() => setView('register')} />
    );
  }

  // If user is logged in but email not verified (and it's not a Google user)
  if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Verify your email</h2>
          <p className="text-slate-600 mb-6">
            We've sent a verification email to <strong>{user.email}</strong>. 
            Please verify your email to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            I've verified my email
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'upload': return <Upload onNavigate={setView} />;
      case 'profile': return <Profile onNavigate={setView} />;
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return <Layout currentView={view} onNavigate={setView}>{renderView()}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
