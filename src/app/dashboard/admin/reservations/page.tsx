"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { getAllReservations } from "@/src/services/reservations.service";
import AdminGuard from "@/src/components/auth/AdminGuard";

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  room: {
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
};

const RESERVATIONS_PER_PAGE = 6;

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchRoom, setSearchRoom] = useState("");
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReservations = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
          setError("Vous devez être connecté pour accéder à cette page.");
        }
        return;
      }

      try {
        const data = await getAllReservations(token);

        if (cancelled) return;

        // Les réservations en cours / à venir sont affichées en premier.
        const sortedReservations = [...data].sort((a, b) => {
          const now = new Date().getTime();

          const aStart = new Date(a.startDate).getTime();
          const bStart = new Date(b.startDate).getTime();

          const aEnd = new Date(a.endDate).getTime();
          const bEnd = new Date(b.endDate).getTime();

          const aCompleted = aEnd < now;
          const bCompleted = bEnd < now;

          // Réservations en cours / à venir en premier
          if (aCompleted && !bCompleted) return 1;
          if (!aCompleted && bCompleted) return -1;

          // Réservations à venir / en cours :
          // la plus proche en premier
          if (!aCompleted && !bCompleted) {
            return aStart - bStart;
          }

          // Réservations terminées :
          // la plus récemment terminée en premier
          return bEnd - aEnd;
        });

        setReservations(sortedReservations);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération réservations :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les réservations.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (reservation: Reservation) => {
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);

    if (endDate < now) {
      return "Terminée";
    }

    if (startDate <= now && now <= endDate) {
      return "En cours";
    }

    return "À venir";
  };

  // Filtres
  const filteredReservations = reservations.filter((reservation) => {
    const status = getStatus(reservation);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "upcoming" && status === "À venir") ||
      (statusFilter === "current" && status === "En cours") ||
      (statusFilter === "completed" && status === "Terminée");

    const matchesRoom = reservation.room.name
      .toLowerCase()
      .includes(searchRoom.toLowerCase());

    const userSearch = searchUser.toLowerCase();

    const matchesUser =
      reservation.user.firstname.toLowerCase().includes(userSearch) ||
      reservation.user.lastname.toLowerCase().includes(userSearch) ||
      reservation.user.email.toLowerCase().includes(userSearch);

    return matchesStatus && matchesRoom && matchesUser;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredReservations.length / RESERVATIONS_PER_PAGE,
  );

  const startIndex = (currentPage - 1) * RESERVATIONS_PER_PAGE;

  const displayedReservations = filteredReservations.slice(
    startIndex,
    startIndex + RESERVATIONS_PER_PAGE,
  );

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Retour */}
          <Link
            href="/dashboard/admin"
            className="text-sm text-gray-500 transition hover:text-[#5F765F]"
          >
            ← Retour au dashboard admin
          </Link>

          {/* Header */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold">Toutes les réservations</h1>

            <p className="mt-2 text-sm text-gray-500">
              Consultez l&apos;ensemble des réservations effectuées.
            </p>
          </div>

          {/* Erreur */}
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          {/* Chargement */}
          {isLoading ? (
            <p className="mt-8 text-sm text-gray-500">
              Chargement des réservations...
            </p>
          ) : reservations.length === 0 ? (
            /* Aucune réservation */
            <div className="mt-8 rounded-lg border border-[#E8E5DE] p-8 text-center">
              <p className="text-sm text-gray-500">
                Aucune réservation enregistrée.
              </p>
            </div>
          ) : (
            <>
              {/* Filtres */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-[#E8E5DE] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
                >
                  <option value="all">Toutes</option>
                  <option value="upcoming">À venir</option>
                  <option value="current">En cours</option>
                  <option value="completed">Terminées</option>
                </select>

                <input
                  type="text"
                  value={searchRoom}
                  onChange={(event) => {
                    setSearchRoom(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Rechercher une salle..."
                  className="w-64 rounded-md border border-[#E8E5DE] px-4 py-2 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
                />

                <input
                  type="text"
                  value={searchUser}
                  onChange={(event) => {
                    setSearchUser(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Rechercher un utilisateur..."
                  className="w-64 rounded-md border border-[#E8E5DE] px-4 py-2 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
                />
              </div>

              {/* Tableau */}
              <div className="mt-8 overflow-hidden rounded-lg border border-[#E8E5DE]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E8E5DE] bg-[#FAF9F6]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Salle</th>

                        <th className="px-6 py-4 font-semibold">Utilisateur</th>

                        <th className="px-6 py-4 font-semibold">Email</th>

                        <th className="px-6 py-4 font-semibold">Date</th>

                        <th className="px-6 py-4 font-semibold">Horaire</th>

                        <th className="px-6 py-4 font-semibold">Statut</th>

                        <th className="px-6 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayedReservations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center">
                            <p className="text-sm text-gray-500">
                              Aucune réservation ne correspond aux filtres
                              sélectionnés.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        displayedReservations.map((reservation) => (
                          <tr
                            key={reservation.id}
                            className="border-b border-gray-100 last:border-0 transition hover:bg-[#FAF9F6]"
                          >
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#FAF9F6]">
                                  {reservation.room.images?.[0]?.url ||
                                  reservation.room.imageUrl ? (
                                    <Image
                                      src={
                                        reservation.room.images?.[0]?.url ||
                                        reservation.room.imageUrl ||
                                        ""
                                      }
                                      alt={reservation.room.name}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                      —
                                    </div>
                                  )}
                                </div>

                                <span>{reservation.room.name}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {reservation.user.firstname}{" "}
                              {reservation.user.lastname}
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {reservation.user.email}
                            </td>

                            <td className="px-6 py-4">
                              {formatDate(reservation.startDate)}
                            </td>

                            <td className="px-6 py-4">
                              {formatTime(reservation.startDate)} -{" "}
                              {formatTime(reservation.endDate)}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                                  getStatus(reservation) === "En cours"
                                    ? "bg-[#E8EEE6] text-[#4F654F]"
                                    : getStatus(reservation) === "À venir"
                                      ? "bg-[#FAF9F6] text-[#5F765F]"
                                      : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {getStatus(reservation)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <Link
                                href={`/dashboard/admin/reservations/${reservation.id}`}
                                className="font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
                              >
                                Voir détails →
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
    </AdminGuard>
  );
}
