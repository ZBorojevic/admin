import React, { useEffect, useState } from 'react';
import { mockDashboard } from '../mockData';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const load = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setData(mockDashboard);
      }
    };

    load();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="New leads (7d)" value={data.newLeads} />
        <Metric label="Qualified leads" value={data.qualifiedLeads} />
        <Metric label="Emails sent (30d)" value={data.sentEmails} />
        <Metric label="Published posts" value={data.publishedPosts} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <List title="Latest leads" items={data.latestLeads?.map((l: any) => `${l.companyName || ''} ${l.email}`)} />
        <List title="Latest messages" items={data.latestMessages?.map((m: any) => `${m.name}: ${m.message}`)} />
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-semibold mb-2">{title}</h3>
    <ul className="space-y-1 text-sm">
      {items?.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

export default DashboardPage;
