import React, { useEffect, useState } from 'react';
import { mockTemplates } from '../mockData';

const EmailTemplatesPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', subject: '', bodyHtml: '' });

  const load = async () => {
    try {
      const res = await fetch('/api/admin/templates', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setTemplates(json);
    } catch (err) {
      setTemplates(mockTemplates);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm({ name: '', subject: '', bodyHtml: '' });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Email templates</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-2">
        <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea className="border p-2 w-full" placeholder="Body HTML" value={form.bodyHtml} onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>
      <div className="bg-white rounded shadow divide-y">
        {templates.map((t) => (
          <div key={t.id} className="p-3">
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-gray-600">{t.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplatesPage;
