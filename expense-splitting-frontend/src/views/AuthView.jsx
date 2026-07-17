import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, Wallet } from 'lucide-react';

const AuthView = ({ onShowToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, authError, clearError } = useAuth();

  const handleTabChange = (loginTab) => {
    setIsLogin(loginTab);
    setUsername('');
    setEmail('');
    setPassword('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      onShowToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (!isLogin && !username.trim()) {
      onShowToast('Username is required for registration.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        onShowToast('Logged in successfully', 'success');
      } else {
        await register(username, email, password);
        onShowToast('Registration successful! You can now log in.', 'success');
        setIsLogin(true);
        setUsername('');
        setPassword('');
        clearError();
      }
    } catch (err) {
      onShowToast(err.message || (isLogin ? 'Login failed' : 'Registration failed'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px hsla(var(--primary), 0.35)',
            border: '1px solid hsla(var(--primary), 0.5)'
          }}>
            <Wallet size={28} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff, hsl(var(--text-muted)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SplitEase
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem' }}>
            Settle up balances with friends, simplified.
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'hsla(var(--bg-main), 0.6)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid hsla(var(--border-color))',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => handleTabChange(true)}
              style={{
                background: isLogin ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' : 'none',
                border: 'none',
                color: isLogin ? 'white' : 'hsl(var(--text-muted))',
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange(false)}
              style={{
                background: !isLogin ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' : 'none',
                border: 'none',
                color: !isLogin ? 'white' : 'hsl(var(--text-muted))',
                padding: '0.6rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {authError && (
              <div style={{
                background: 'hsla(var(--danger), 0.1)',
                border: '1px solid hsla(var(--danger), 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                color: 'hsl(var(--danger))',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                {authError}
              </div>
            )}

            {!isLogin && (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-username">Username</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
                  <input
                    id="reg-username"
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', width: '100%' }}
                    placeholder="e.g. JohnDoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="auth-email">Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
                <input
                  id="auth-email"
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="auth-password">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
                <input
                  id="auth-password"
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Register Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
