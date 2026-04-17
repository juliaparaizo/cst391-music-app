'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Rule {
  id: number;
  name: string;
  criteria_field: string;
  criteria_value: string;
  role_required: string;
  created_by: string;
  created_at: string;
}

interface Album {
  id: number;
  title: string;
  artist: string;
}

const EMPTY_FORM = { name: '', criteria_field: 'artist', criteria_value: '', role_required: 'admin' };

export default function AdminRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [linkRuleId, setLinkRuleId] = useState('');
  const [linkAlbumId, setLinkAlbumId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const me = await meRes.json();
      if (me.role !== 'admin') { router.push('/403'); return; }
      await loadRules();
      const albumRes = await fetch('/api/albums');
      if (albumRes.ok) setAlbums(await albumRes.json());
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadRules() {
    const res = await fetch('/api/rules');
    if (res.ok) setRules(await res.json());
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/rules/${editingId}` : '/api/rules';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadRules();
      showMessage(editingId ? 'Rule updated.' : 'Rule created.');
    }
  }

  function startEdit(rule: Rule) {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      criteria_field: rule.criteria_field,
      criteria_value: rule.criteria_value,
      role_required: rule.role_required,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this rule?')) return;
    const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadRules();
      showMessage('Rule deleted.');
    }
  }

  async function handleLink(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: parseInt(linkRuleId), album_id: parseInt(linkAlbumId) }),
    });
    if (res.ok) {
      setLinkRuleId(''); setLinkAlbumId('');
      showMessage('Rule linked to album.');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-400">Music App</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-purple-900/70 text-purple-300">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/recommendations/analytics" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {message && (
          <div className="bg-green-900/40 border border-green-600 text-green-300 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Create / Edit Rule Form */}
        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-5">
            {editingId ? `Edit Rule #${editingId}` : 'Create New Rule'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rule Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Boost Beatles Albums"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Criteria Field</label>
              <select
                value={form.criteria_field}
                onChange={e => setForm({ ...form, criteria_field: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="artist">Artist</option>
                <option value="year">Year</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Criteria Value</label>
              <input
                value={form.criteria_value}
                onChange={e => setForm({ ...form, criteria_value: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. The Beatles"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role Required</label>
              <select
                value={form.role_required}
                onChange={e => setForm({ ...form, role_required: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                {editingId ? 'Save Changes' : '+ Create Rule'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Rules Table */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recommendation Rules</h2>
          {rules.length === 0 ? (
            <p className="text-gray-400">No rules yet. Create one above.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Field</th>
                    <th className="px-4 py-3 text-left">Value</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Created By</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800/50">
                  {rules.map(rule => (
                    <tr key={rule.id} className="hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{rule.id}</td>
                      <td className="px-4 py-3 font-medium">{rule.name}</td>
                      <td className="px-4 py-3 text-gray-300">{rule.criteria_field}</td>
                      <td className="px-4 py-3 text-gray-300">{rule.criteria_value}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          rule.role_required === 'admin'
                            ? 'bg-purple-900/60 text-purple-300'
                            : 'bg-blue-900/60 text-blue-300'
                        }`}>
                          {rule.role_required}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{rule.created_by}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => startEdit(rule)}
                          className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Link Rule to Album */}
        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-5">Link Rule to Album</h2>
          <form onSubmit={handleLink} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rule</label>
              <select
                value={linkRuleId}
                onChange={e => setLinkRuleId(e.target.value)}
                required
                className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select rule...</option>
                {rules.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Album</label>
              <select
                value={linkAlbumId}
                onChange={e => setLinkAlbumId(e.target.value)}
                required
                className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select album...</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.title} — {a.artist}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              Link
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
