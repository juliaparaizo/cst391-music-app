"use client";

import { useSession } from "next-auth/react";
import { Album } from "@/lib/types";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2">
      {album.image && (
        <img
          src={album.image}
          alt={album.title}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h2 className="text-xl font-semibold">{album.title}</h2>
      <p className="text-gray-600">{album.artist} &bull; {album.year}</p>
      {album.description && (
        <p className="text-sm text-gray-500">{album.description}</p>
      )}

      <div className="flex gap-2 mt-2">
        {session && (
          <a
            href={`/albums/${album.id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            View
          </a>
        )}

        {isAdmin && (
          <a
            href={`/albums/${album.id}/edit`}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
          >
            Edit
          </a>
        )}
      </div>
    </div>
  );
}
