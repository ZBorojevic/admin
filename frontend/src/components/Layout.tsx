import { Link } from 'react-router-dom';
import React from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/email/templates', label: 'Email Templates' },
  { to: '/admin/email/campaigns', label: 'Email Campaigns' },
  { to: '/admin/services', label: 'Servisi' },
];

export const Layout: React.FC<{ children: React.ReactNode; onLogout?: () => void }> = ({ children, onLogout }) => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold">Fresh Studio Admin</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.to} className="block rounded px-3 py-2 hover:bg-gray-700" to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <header className="flex justify-end mb-4">
          <button className="text-sm text-blue-600" onClick={onLogout}>
            Logout
          </button>
        </header>
        {children}
      </main>
    </div>
  );
};
