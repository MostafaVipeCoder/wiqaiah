import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // If we are still checking admin status, show nothing or a subtle loader to prevent flicker
  if (authLoading && user) return null;

  // ONLY redirect if they are logged in AND an admin
  if (user && isAdmin) return <Navigate to="/dashboard" />;

  // If logged in but NOT an admin, and NOT loading, show unauthorized message
  if (user && !isAdmin && !authLoading) {
    return (
      <div className="login-page container section-padding">
        <div className="login-card animate-fade-up">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Wiqaiah" className="login-logo" />
          <div className="unauthorized-message" style={{ margin: '20px 0', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>{t('login_page.unauthorized_title')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{t('login_page.unauthorized_msg')}</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{user.email}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button onClick={() => logout()} className="primary-btn" style={{ background: '#ef4444' }}>
              {t('dashboard_nav.logout')}
            </button>
            <button onClick={() => navigate('/')} className="secondary-btn">
              {t('common.back_home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const loginPromise = login(email, password);
    
    toast.promise(loginPromise, {
      loading: t('login_page.logging_in'),
      success: t('login_page.success'),
      error: t('login_page.failed'),
    });

    const { error } = await loginPromise;
    if (!error) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="login-page container section-padding">
      <div className="login-card animate-fade-up">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Wiqaiah" className="login-logo" />
        <h2>{t('login_page.title')}</h2>
        <p>{t('login_page.subtitle')}</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>{t('login_page.email')}</label>
            <input 
              type="email" required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@wiqaiah.com"
            />
          </div>
          <div className="input-group">
            <label>{t('login_page.password')}</label>
            <input 
              type="password" required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="primary-btn login-btn">
            {loading ? t('login_page.logging_in') : t('login_page.btn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
