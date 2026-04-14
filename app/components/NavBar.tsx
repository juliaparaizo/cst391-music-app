"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-6">
      <Link href="/" className="font-bold text-lg hover:text-gray-300">
        Music App
      </Link>

      {session && (
        <Link href="/" className="hover:text-gray-300">
          Home
        </Link>
      )}

      {isAdmin && (
        <Link href="/albums/new" className="hover:text-gray-300">
          New Album
        </Link>
      )}

      <div className="ml-auto flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-gray-400">
              {session.user?.name} ({session.user?.role})
            </span>
            <a href="/api/auth/signout" className="hover:text-gray-300">
              Sign Out
            </a>
          </>
        ) : (
          <a href="/api/auth/signin" className="hover:text-gray-300">
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
}
