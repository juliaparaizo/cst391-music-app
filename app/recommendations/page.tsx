'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RecommendedAlbum {
  id: number;
  rule_name: string;
  album_title: string;
  artist: string;
  year: number;
  album_id: number;
  rule_id: number;
}

interface FeedbackState {
  [albumId: number]: 'LIKE' | 'DISLIKE' | 'NOT_INTERESTED' | null;
}

type Role = 'guest' | 'customer' | 'admin';

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    guest: 'bg-gray-700 text-gray-300',
    customer: 'bg-blue-900/70 text-blue-300',
    admin: 'bg-purple-900/70 text-purple-300',
  };
  const labels: Record<Role, string> = {
    guest: 'Guest',
    customer: 'Customer',
    admin: 'Admin',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('guest');
  const [username, setUsername] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedAlbum[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      // Check session — guests are allowed (no redirect)
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const me = await meRes.json();
        setUsername(me.username);
        setRole(me.role === 'admin' ? 'admin' : 'customer');
      }
      // else: unauthenticated guest, stay on page with limited view

      const recRes = await fetch('/api/recommendations');
      if (recRes.ok) {
        setRecommendations(await recRes.json());
      } else {
        setError('Failed to load recommendations.');
      }
      setLoading(false);
    }
    init();
  }, []);

  async function sendFeedback(albumId: number, ruleId: number, feedbackType: 'LIKE' | 'DISLIKE' | 'NOT_INTERESTED') {
    if (role === 'guest') return;
    setFeedback(prev => ({ ...prev, [albumId]: feedbackType }));
    await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId, feedbackType, ruleId }),
    });
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-indigo-400">Music App</h1>
          <RoleBadge role={role} />
        </div>
        <div className="flex items-center gap-4">
          {role !== 'guest' && (
            <span className="text-gray-400 text-sm">
              Signed in as <span className="text-white font-medium">{username}</span>
            </span>
          )}
          {role === 'admin' && (
            <Link
              href="/admin/recommendations/rules"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          {role === 'guest' ? (
            <Link
              href="/login"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-sm rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">Recommended Albums</h2>
        <p className="text-gray-400 mb-4">Albums curated by our recommendation engine.</p>

        {/* Guest banner */}
        {role === 'guest' && (
          <div className="bg-indigo-900/30 border border-indigo-700 rounded-xl px-5 py-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-300 font-medium text-sm">You&apos;re browsing as a guest.</p>
              <p className="text-gray-400 text-sm mt-0.5">Sign in to like albums and personalize your recommendations.</p>
            </div>
            <Link
              href="/login"
              className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {recommendations.length === 0 && !error && (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
            <p className="text-lg mb-2">No recommendations yet.</p>
            <p className="text-sm">An admin needs to link recommendation rules to albums first.</p>
          </div>
        )}

        <div className="space-y-4">
          {recommendations.map(rec => {
            const fb = feedback[rec.album_id];
            const dismissed = fb === 'NOT_INTERESTED';

            if (dismissed) return null;

            return (
              <div key={rec.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{rec.album_title}</h3>
                    <p className="text-gray-400">{rec.artist} &middot; {rec.year}</p>
                    <p className="text-xs text-indigo-400 mt-1">Reason: {rec.rule_name}</p>
                  </div>

                  {/* Feedback buttons — customers and admins only */}
                  {role !== 'guest' ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => sendFeedback(rec.album_id, rec.rule_id, 'LIKE')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          fb === 'LIKE'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 hover:bg-green-700 text-gray-300'
                        }`}
                      >
                        Like
                      </button>
                      <button
                        onClick={() => sendFeedback(rec.album_id, rec.rule_id, 'DISLIKE')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          fb === 'DISLIKE'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 hover:bg-red-700 text-gray-300'
                        }`}
                      >
                        Dislike
                      </button>
                      <button
                        onClick={() => sendFeedback(rec.album_id, rec.rule_id, 'NOT_INTERESTED')}
                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg transition-colors"
                      >
                        Not Interested
                      </button>
                    </div>
                  ) : (
                    /* Guest: show a muted sign-in prompt instead of buttons */
                    <Link
                      href="/login"
                      className="shrink-0 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg transition-colors"
                    >
                      Sign in to react
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
