import React, { useEffect, useState } from 'react';
import { mockCampaigns, mockLeads, mockTemplates } from '../mockData';

const EmailCampaignsPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', templateId: '', segmentCity: '', onlyQualified: true });
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const campaignRes = await fetch('/api/admin/campaigns', { headers: { Authorization: `Bearer ${token}` } });
        const templateRes = await fetch('/api/admin/templates', { headers: { Authorization: `Bearer ${token}` } });
        if (!campaignRes.ok || !templateRes.ok) throw new Error('Failed');
        setCampaigns(await campaignRes.json());
        setTemplates(await templateRes.json());
      } catch (err) {
        setCampaigns(mockCampaigns);
        setTemplates(mockTemplates);
      }
    };

    load();
  }, []);

  const simulate = async () => {
    if (!form.templateId) return;
    try {
      const res = await fetch(`/api/admin/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, templateId: Number(form.templateId) }),
      });
      const created = await res.json();
      const sim = await fetch(`/api/admin/campaigns/${created.id}/simulate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setSimulation(sim);
      setCampaigns((prev) => [created, ...prev]);
    } catch (err) {
      const created = {
        id: Date.now(),
        name: form.name || 'Nova kampanja',
        status: 'draft',
        totalRecipients: mockLeads.length,
        sentCount: 0,
        failedCount: 0,
      };
      setSimulation({ count: mockLeads.length, preview: mockLeads.slice(0, 3) });
      setCampaigns((prev) => [created, ...prev]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Email kampanje</h2>
      <div className="bg-white p-4 rounded shadow space-y-2">
        <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="border p-2" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
          <option value="">Odaberi template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input className="border p-2" placeholder="City segment" value={form.segmentCity} onChange={(e) => setForm({ ...form, segmentCity: e.target.value })} />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.onlyQualified} onChange={(e) => setForm({ ...form, onlyQualified: e.target.checked })} />
          <span>Only qualified</span>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={simulate}>Create & Simulate</button>
        {simulation && <p className="text-sm">Recipients: {simulation.count}</p>}
      </div>
      <div className="bg-white rounded shadow divide-y">
        {campaigns.map((c) => (
          <div key={c.id} className="p-3 flex justify-between">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">Status: {c.status}</p>
            </div>
            <button
              className="text-blue-600"
              onClick={() =>
                fetch(`/api/admin/campaigns/${c.id}/send`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                  .then(() => alert('Scheduled'))
                  .catch(() => alert('Mock send triggered'))
              }
            >
              Send now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailCampaignsPage;
