import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import BlogPage from './pages/Blog';
import LeadsPage from './pages/Leads';
import EmailTemplatesPage from './pages/EmailTemplates';
import EmailCampaignsPage from './pages/EmailCampaigns';
import ServicesPage from './pages/Services';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);
  return <>{token ? children : null}</>;
};

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/admin/login');
  };

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage onLogin={(t) => { setToken(t); navigate('/admin'); }} />} />
      <Route
        path="/admin/*"
        element={
          <Protected>
            <Layout onLogout={logout}>
              <Routes>
                <Route path="" element={<DashboardPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="email/templates" element={<EmailTemplatesPage />} />
                <Route path="email/campaigns" element={<EmailCampaignsPage />} />
                <Route path="services" element={<ServicesPage />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}
