"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  images: {
    id: number;
    url: string;
  }[];
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Impossible de récupérer les salles.",
          );
        }

        setRooms(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les salles.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    getRooms();
  }, []);

  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const startIndex = (currentPage - 1) * roomsPerPage;

  const paginatedRooms = rooms.slice(startIndex, startIndex + roomsPerPage);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold">Les salles</h1>

          <p className="mt-2 text-sm text-gray-500">
            Consultez les salles disponibles et leurs caractéristiques.
          </p>

          {!isLoading && rooms.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {rooms.length} salle{rooms.length > 1 ? "s" : ""} disponible
              {rooms.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Chargement des salles...</p>
        ) : rooms.length === 0 ? (
          <div className="mt-8 rounded-xl border border-[#E8E5DE] bg-white p-8 text-center">
            <p className="text-sm text-gray-500">Aucune salle disponible.</p>
          </div>
        ) : (
          <>
            {/* Liste des salles */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/dashboard/salles/${room.id}`}
                  className="group overflow-hidden rounded-xl border border-[#E8E5DE] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full bg-[#FAF9F6] sm:h-52">
                    {room.images?.[0]?.url ? (
                      <Image
                        loading="eager"
                        src={room.images[0].url}
                        alt={room.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Aucune image
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-[#1F2A24] transition group-hover:text-[#5F765F]">
                      {room.name}
                    </h2>

                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-500">
                        Capacité : {room.capacity} personne
                        {room.capacity > 1 ? "s" : ""}
                      </p>

                      <p className="text-sm text-gray-500">{room.location}</p>

                      <p className="text-sm text-gray-500">
                        {room.equipment || "Aucun équipement renseigné"}
                      </p>
                    </div>

                    <span className="mt-5 inline-block text-sm font-semibold text-[#5F765F] transition group-hover:text-[#4F654F]">
                      Voir la salle →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#E8E5DE] px-4 py-2 text-sm font-medium transition hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Précédent
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-[#5F765F] text-white"
                        : "border border-[#E8E5DE] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-[#E8E5DE] px-4 py-2 text-sm font-medium transition hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
