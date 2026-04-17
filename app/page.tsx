import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-indigo-400 mb-2">Music App</h1>
        <p className="text-gray-400 mb-10">Admin-Driven Recommendation Rules Engine</p>

        {/* Sign in — leads to role-appropriate dashboard */}
        <Link
          href="/login"
          className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-lg transition-colors mb-4"
        >
          Sign In
        </Link>

        {/* Role paths */}
        <div className="space-y-2">
          {/* Guest path */}
          <Link
            href="/recommendations"
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors group"
          >
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 group-hover:text-gray-400 mr-2">Guest</span>
              <span className="text-gray-300">Browse Recommendations</span>
            </div>
            <span className="text-gray-600 text-xs">No login required →</span>
          </Link>

          {/* Customer path */}
          <Link
            href="/login"
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors group"
          >
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 group-hover:text-blue-500 mr-2">Customer</span>
              <span className="text-gray-300">Like &amp; Rate Albums</span>
            </div>
            <span className="text-gray-600 text-xs">Login required →</span>
          </Link>

          {/* Admin path */}
          <Link
            href="/login"
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors group"
          >
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-purple-500 group-hover:text-purple-400 mr-2">Admin</span>
              <span className="text-gray-300">Manage Rules &amp; Analytics</span>
            </div>
            <span className="text-gray-600 text-xs">Admin login →</span>
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8">CST-391 Milestone 5 &mdash; Julia Paraizo</p>
      </div>
    </main>
  );
}
