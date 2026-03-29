import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  if (user) return <Navigate to="/dashboard" />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await login(email, password);
    if (error) {
      setError(i18n.language === 'ar' ? 'خطأ في الدخول. تأكد من البيانات.' : 'Login failed. Check your credentials.');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="login-page container section-padding">
      <div className="login-card animate-fade-up">
        <img src="/logo.svg" alt="Wiqaiah" className="login-logo" />
        <h2>{i18n.language === 'ar' ? 'دخول الطبيب' : 'Doctor Login'}</h2>
        <p>{i18n.language === 'ar' ? 'قم بتسجيل الدخول لإدارة حجوزاتك والويبنارز.' : 'Login to manage your bookings and webinars.'}</p>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label>{i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <input 
              type="email" required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@wiqaiah.com"
            />
          </div>
          <div className="input-group">
            <label>{i18n.language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input 
              type="password" required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="primary-btn login-btn">
            {loading ? (i18n.language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (i18n.language === 'ar' ? 'دخول' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
