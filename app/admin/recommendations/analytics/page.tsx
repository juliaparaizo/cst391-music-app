'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsRow {
  rule_name: string | null;
  likes: string;
  dislikes: string;
  not_interested: string;
  total_events: string;
}

interface RecommendationRow {
  id: number;
  rule_name: string;
  album_title: string;
  artist: string;
  year: number;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const me = await meRes.json();
      if (me.role !== 'admin') { router.push('/403'); return; }

      const [fbRes, recRes] = await Promise.all([
        fetch('/api/recommendations/feedback'),
        fetch('/api/recommendations'),
      ]);
      if (fbRes.ok) setAnalytics(await fbRes.json());
      if (recRes.ok) setRecommendations(await recRes.json());
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading analytics...</p>
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
          <Link href="/admin/recommendations/rules" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Rules
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
        <h2 className="text-3xl font-bold">Recommendation Analytics</h2>

        {/* Feedback Summary */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Feedback by Rule</h3>
          {analytics.length === 0 ? (
            <p className="text-gray-400">No feedback events recorded yet. Customers need to interact with recommendations.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Rule Name</th>
                    <th className="px-4 py-3 text-center">Likes</th>
                    <th className="px-4 py-3 text-center">Dislikes</th>
                    <th className="px-4 py-3 text-center">Not Interested</th>
                    <th className="px-4 py-3 text-center">Total Events</th>
                    <th className="px-4 py-3 text-center">Like Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800/50">
                  {analytics.map((row, i) => {
                    const total = parseInt(row.total_events) || 0;
                    const likes = parseInt(row.likes) || 0;
                    const likeRate = total > 0 ? Math.round((likes / total) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.rule_name ?? '(no rule)'}</td>
                        <td className="px-4 py-3 text-center text-green-400">{row.likes}</td>
                        <td className="px-4 py-3 text-center text-red-400">{row.dislikes}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{row.not_interested}</td>
                        <td className="px-4 py-3 text-center">{row.total_events}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${likeRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {likeRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Active Recommendations */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Active Recommendations</h3>
          {recommendations.length === 0 ? (
            <p className="text-gray-400">No recommendations linked yet. Go to <Link href="/admin/recommendations/rules" className="text-indigo-400 underline">Rules</Link> to link a rule to an album.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Rule</th>
                    <th className="px-4 py-3 text-left">Album</th>
                    <th className="px-4 py-3 text-left">Artist</th>
                    <th className="px-4 py-3 text-left">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800/50">
                  {recommendations.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{rec.id}</td>
                      <td className="px-4 py-3 text-indigo-400">{rec.rule_name}</td>
                      <td className="px-4 py-3 font-medium">{rec.album_title}</td>
                      <td className="px-4 py-3 text-gray-300">{rec.artist}</td>
                      <td className="px-4 py-3 text-gray-300">{rec.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
