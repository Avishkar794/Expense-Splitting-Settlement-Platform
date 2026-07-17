import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import GroupDetailView from './views/GroupDetailView';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import './App.css';

const MainApp = ({ onShowToast }) => {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState({ page: 'dashboard', groupId: null });

  // Handle auto-redirection if unauthorized event occurs
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentRoute({ page: 'dashboard', groupId: null });
      onShowToast('Session expired. Please sign in again.', 'warning');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [onShowToast]);

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthView onShowToast={onShowToast} />;
  }

  if (currentRoute.page === 'group') {
    return (
      <GroupDetailView
        groupId={currentRoute.groupId}
        onBack={() => setCurrentRoute({ page: 'dashboard', groupId: null })}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <DashboardView
      onViewGroup={(id) => setCurrentRoute({ page: 'group', groupId: id })}
      onShowToast={onShowToast}
    />
  );
};

const App = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  return (
    <AuthProvider>
      <div className="app-container">
        <MainApp onShowToast={showToast} />
        
        {/* Global Toasts Container */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className={`toast toast-${toast.type}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'hsl(var(--success))' }} />}
              {toast.type === 'danger' && <AlertCircle size={18} style={{ color: 'hsl(var(--danger))' }} />}
              {toast.type === 'warning' && <Info size={18} style={{ color: 'hsl(var(--warning))' }} />}
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
