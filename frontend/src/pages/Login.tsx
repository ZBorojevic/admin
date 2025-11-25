import React, { useState } from 'react';

const LoginPage: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@freshstudio.hr');
  const [password, setPassword] = useState('changeme123');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      onLogin(data.token);
    } catch (err) {
      localStorage.setItem('token', 'demo-preview');
      onLogin('demo-preview');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 shadow rounded w-96 space-y-4">
        <h1 className="text-xl font-bold">Admin login</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input
          className="w-full border p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded" type="submit">
          Login
        </button>
        <button
          type="button"
          className="w-full border border-blue-200 text-blue-700 p-2 rounded"
          onClick={() => {
            localStorage.setItem('token', 'demo-preview');
            onLogin('demo-preview');
          }}
        >
          Nastavi u demo modu
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
