"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AlbumCard from "./components/AlbumCard";
import { Album } from "@/lib/types";

export default function Home() {
  const { data: session } = useSession();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/albums")
        .then((res) => res.json())
        .then((data) => {
          setAlbums(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Music App</h1>
        <p className="text-gray-600">Please sign in to browse albums.</p>
      </main>
    );
  }

  if (loading) {
    return <main className="p-8">Loading albums...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Albums</h1>
      {albums.length === 0 ? (
        <p className="text-gray-500">No albums found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </main>
  );
}
