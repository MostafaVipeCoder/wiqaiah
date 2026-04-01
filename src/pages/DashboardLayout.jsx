import React, { Suspense, lazy } from 'react';
import { NavLink, useNavigate, useLocation, Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Calendar, 
  Video, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardLayout.css';

// LAZY LOAD DASHBOARD PAGES
const ManageBookings = lazy(() => import('../components/dashboard/ManageBookings'));
const ManageAvailability = lazy(() => import('../components/dashboard/ManageAvailability'));
const ManageWebinars = lazy(() => import('../components/dashboard/ManageWebinars'));
const SiteSettings = lazy(() => import('../components/dashboard/SiteSettings'));

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard/bookings', icon: Users, label: t('dashboard_nav.bookings') },
    { path: '/dashboard/availability', icon: Calendar, label: t('dashboard_nav.availability') },
    { path: '/dashboard/webinars', icon: Video, label: t('dashboard_nav.webinars') },
    { path: '/dashboard/settings', icon: Settings, label: t('dashboard_nav.settings') },
  ];

  const currentLabel = navItems.find(i => location.pathname.startsWith(i.path))?.label 
    || t('dashboard_nav.root');

  return (
    <div className="dashboard-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="logo.svg" alt="Wiqaiah" className="sidebar-logo" />
          <span className="badge-admin">ADMIN</span>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-email">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>{t('dashboard_nav.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
           <div className="header-breadcrumbs">
              <span className="breadcrumb-root">{t('dashboard_nav.root')}</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{currentLabel}</span>
           </div>
           
           <div className="header-actions">
              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
                className="lang-pill"
              >
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </button>
           </div>
        </header>

        <div className="dashboard-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route index element={<Navigate to="bookings" replace />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="availability" element={<ManageAvailability />} />
              <Route path="webinars" element={<ManageWebinars />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="*" element={<Navigate to="bookings" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
