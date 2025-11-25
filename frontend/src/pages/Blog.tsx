import React, { useEffect, useState } from 'react';
import { mockBlogPosts } from '../mockData';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', slug: '', status: 'draft', content: '' });
  const token = localStorage.getItem('token');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/blog/posts', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setPosts(json);
    } catch (err) {
      setPosts(mockBlogPosts);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, categoryIds: [], tagIds: [] }),
    });
    setForm({ title: '', slug: '', status: 'draft', content: '' });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Blog posts</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-2">
        <input className="border p-2 w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
        <input className="border p-2 w-full" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <textarea className="border p-2 w-full" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <select className="border p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
      </form>
      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogPage;
