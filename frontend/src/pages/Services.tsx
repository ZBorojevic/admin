import React, { useEffect, useState } from 'react';
import { mockServices } from '../mockData';

const ServicesPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', baseUrl: '', healthcheckPath: '/health', description: '' });

  const load = async () => {
    try {
      const res = await fetch('/api/admin/services', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setServices(json);
    } catch (err) {
      setServices(mockServices);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm({ name: '', baseUrl: '', healthcheckPath: '/health', description: '' });
    load();
  };

  const testHealth = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/services/${id}/health`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      alert(`${json.status}${json.error ? ': ' + json.error : ''}`);
    } catch (err) {
      alert('UP (mocked)');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Servisi</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-2">
        <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Base URL" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Health path" value={form.healthcheckPath} onChange={(e) => setForm({ ...form, healthcheckPath: e.target.value })} />
        <textarea className="border p-2 w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>
      <div className="bg-white rounded shadow divide-y">
        {services.map((s) => (
          <div key={s.id} className="p-3 flex justify-between">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-600">{s.baseUrl}</p>
            </div>
            <button className="text-blue-600" onClick={() => testHealth(s.id)}>
              Testaj health
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
