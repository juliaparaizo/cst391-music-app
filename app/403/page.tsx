import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-8">You do not have permission to view this page.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/recommendations" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Go to Recommendations
          </Link>
          <Link href="/login" className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
