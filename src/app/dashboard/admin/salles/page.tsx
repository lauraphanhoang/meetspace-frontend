"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { deleteRoom, getRooms } from "@/src/services/reservations.service";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  imageUrl?: string | null;
  images?: {
    id: number;
    url: string;
  }[];
};

const ROOMS_PER_PAGE = 6;

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      try {
        const data = await getRooms();

        if (cancelled) return;

        setRooms(data);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération salles :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les salles.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (room: Room) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${room.name}" ?`,
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Vous devez être connecté.");
      return;
    }

    try {
      setError("");
      setDeletingId(room.id);

      await deleteRoom(token, room.id);

      setRooms((currentRooms) =>
        currentRooms.filter((currentRoom) => currentRoom.id !== room.id),
      );
    } catch (error) {
      console.error("Erreur suppression salle :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la salle.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Recherche
  const filteredRooms = rooms.filter((room) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      room.name.toLowerCase().includes(searchValue) ||
      room.location.toLowerCase().includes(searchValue) ||
      room.equipment?.toLowerCase().includes(searchValue)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;

  const displayedRooms = filteredRooms.slice(
    startIndex,
    startIndex + ROOMS_PER_PAGE,
  );

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Retour */}
        <Link
          href="/dashboard/admin"
          className="text-sm text-gray-500 transition hover:text-[#5F765F]"
        >
          ← Retour au dashboard admin
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des salles</h1>

            <p className="mt-1 text-sm text-gray-500">
              {filteredRooms.length} salle
              {filteredRooms.length > 1 ? "s" : ""}
            </p>
          </div>

          <Link
            href="/dashboard/admin/salles/new"
            className="w-full rounded-md bg-[#5F765F] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#4F654F] sm:w-auto"
          >
            + Ajouter une salle
          </Link>
        </div>

        {/* Barre de recherche */}
        {!isLoading && rooms.length > 0 && (
          <div className="mt-8">
            <label htmlFor="room-search" className="sr-only">
              Rechercher une salle
            </label>

            <input
              id="room-search"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher une salle..."
              className="w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
            />
          </div>
        )}

        {/* Erreur */}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {/* Chargement */}
        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Chargement des salles...</p>
        ) : rooms.length === 0 ? (
          /* Aucune salle */
          <div className="mt-8 rounded-lg border border-[#E8E5DE] p-8 text-center">
            <p className="text-sm text-gray-500">Aucune salle enregistrée.</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          /* Aucun résultat de recherche */
          <div className="mt-8 rounded-lg border border-[#E8E5DE] p-8 text-center">
            <p className="text-sm text-gray-500">
              Aucune salle ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <>
            {/* Grille des salles */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {displayedRooms.map((room) => {
                const firstImage = room.images?.[0]?.url || room.imageUrl;

                return (
                  <div
                    key={room.id}
                    className="overflow-hidden rounded-xl border border-[#E8E5DE] bg-white transition hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative h-56 w-full bg-[#FAF9F6] sm:h-64">
                      {firstImage ? (
                        <Image
                          loading="eager"
                          src={firstImage}
                          alt={room.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          Aucune photo
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="p-5">
                      <h2 className="text-lg font-semibold">{room.name}</h2>

                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        <p>
                          {room.capacity} personne
                          {room.capacity > 1 ? "s" : ""}
                        </p>

                        <p>{room.location}</p>

                        {room.equipment && <p>{room.equipment}</p>}
                      </div>

                      {/* Boutons */}
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/dashboard/admin/salles/${room.id}/edit`}
                          className="flex-1 rounded-md border border-[#E8E5DE] px-4 py-2 text-center text-sm font-medium text-[#4F654F] transition hover:bg-[#FAF9F6]"
                        >
                          Modifier
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(room)}
                          disabled={deletingId === room.id}
                          className="flex-1 rounded-md bg-[#5F765F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === room.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#E8E5DE] px-4 py-2 text-sm font-medium transition hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Précédent
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
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
