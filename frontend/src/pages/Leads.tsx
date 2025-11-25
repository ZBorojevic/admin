import React, { useEffect, useState } from 'react';
import { mockLeads } from '../mockData';

const LeadsPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const load = async () => {
    const url = '/api/admin/leads' + (search ? `?search=${encodeURIComponent(search)}` : '');
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setLeads(json);
    } catch (err) {
      const filtered = mockLeads.filter((lead) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
          lead.companyName?.toLowerCase().includes(term) ||
          lead.firstName?.toLowerCase().includes(term) ||
          lead.lastName?.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term)
        );
      });
      setLeads(filtered);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/admin/leads/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      setImportResult(await res.json());
      load();
    } catch (err) {
      setImportResult({ insertedCount: 0, updatedCount: 0, mocked: true });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Leads</h2>
      <div className="flex space-x-2">
        <input className="border p-2" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="bg-blue-600 text-white px-4" onClick={load}>Search</button>
      </div>
      <div className="bg-white rounded shadow">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Company</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Email</th>
              <th className="p-2">City</th>
              <th className="p-2">Qualified</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-2">{l.companyName}</td>
                <td className="p-2">{`${l.firstName || ''} ${l.lastName || ''}`}</td>
                <td className="p-2">{l.email}</td>
                <td className="p-2">{l.city}</td>
                <td className="p-2">{l.isQualified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h3 className="font-semibold">Import CSV</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={upload}>Upload</button>
        {importResult && (
          <p className="text-sm text-gray-700">
            Inserted: {importResult.insertedCount}, Updated: {importResult.updatedCount}
          </p>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
