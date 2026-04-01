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
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  if (user) return <Navigate to="/dashboard" />;

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
        <img src="logo.svg" alt="Wiqaiah" className="login-logo" />
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
