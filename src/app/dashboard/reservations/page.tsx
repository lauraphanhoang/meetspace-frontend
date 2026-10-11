"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { getMyReservations } from "@/src/services/reservations.service";

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  room: {
    id: number;
    name: string;
    capacity: number;
    location: string;
    equipment: string;
    images: {
      id: number;
      url: string;
    }[];
  };
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 4;

  useEffect(() => {
    let cancelled = false;

    const loadReservations = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
          setError("Vous devez être connecté pour voir vos réservations.");
        }
        return;
      }

      try {
        const data = await getMyReservations(token);

        if (cancelled) return;

        const now = new Date().getTime();

        const sortedReservations = [...data].sort((a, b) => {
          const aStart = new Date(a.startDate).getTime();
          const bStart = new Date(b.startDate).getTime();

          const aEnd = new Date(a.endDate).getTime();
          const bEnd = new Date(b.endDate).getTime();

          const aCompleted = aEnd < now;
          const bCompleted = bEnd < now;

          // Les réservations terminées vont à la fin
          if (aCompleted && !bCompleted) return 1;
          if (!aCompleted && bCompleted) return -1;

          // Réservations à venir / en cours :
          // de la plus proche à la plus lointaine
          if (!aCompleted && !bCompleted) {
            return aStart - bStart;
          }

          // Réservations terminées :
          // de la plus récente à la plus ancienne
          return bEnd - aEnd;
        });

        setReservations(sortedReservations);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération réservations :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer vos réservations.",
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

  const totalPages = Math.ceil(reservations.length / reservationsPerPage);

  const startIndex = (currentPage - 1) * reservationsPerPage;

  const paginatedReservations = reservations.slice(
    startIndex,
    startIndex + reservationsPerPage,
  );

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes réservations</h1>

            <p className="mt-2 text-sm text-gray-500">
              Retrouvez ici toutes vos réservations.
            </p>
          </div>

          <Link
            href="/dashboard/reservation"
            className="w-full rounded-md bg-[#5F765F] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#4F654F] sm:w-auto"
          >
            + Nouvelle réservation
          </Link>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {/* Liste des réservations */}
        <div className="mt-8 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">
              Chargement de vos réservations...
            </p>
          ) : reservations.length === 0 ? (
            <div className="rounded-lg border border-[#E8E5DE] bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                Vous n&apos;avez aucune réservation.
              </p>

              <Link
                href="/dashboard/reservation"
                className="mt-4 inline-block text-sm font-semibold text-[#5F765F] transition hover:text-[#4F654F]"
              >
                Créer une réservation →
              </Link>
            </div>
          ) : (
            paginatedReservations.map((reservation) => {
              const status = getStatus(reservation);

              return (
                <div
                  key={reservation.id}
                  className="rounded-xl border border-[#E8E5DE] bg-white p-4 transition hover:shadow-md sm:p-5"
                >
                  {/* Photo + informations */}
                  <div className="flex min-w-0 items-start gap-4 sm:flex-1">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#FAF9F6] sm:h-24 sm:w-24">
                      {reservation.room.images?.[0]?.url ? (
                        <Image
                          src={reservation.room.images[0].url}
                          alt={reservation.room.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-gray-400">
                          Aucune image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/reservations/${reservation.id}`}
                        className="font-semibold text-[#1F2A24] transition hover:text-[#5F765F]"
                      >
                        {reservation.room.name}
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        Du {formatDate(reservation.startDate)}
                      </p>

                      <p className="text-sm text-gray-500">
                        Au {formatDate(reservation.endDate)}
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatTime(reservation.startDate)} -{" "}
                        {formatTime(reservation.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Statut + détails */}
                  <div className="mt-4 flex w-full flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-end">
                    <span
                      className={`rounded-md px-4 py-2 text-center text-sm font-medium ${
                        status === "En cours"
                          ? "bg-[#E8EEE6] text-[#4F654F]"
                          : status === "À venir"
                            ? "bg-[#FAF9F6] text-[#5F765F]"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {status}
                    </span>

                    <Link
                      href={`/dashboard/reservations/${reservation.id}`}
                      className="rounded-md border border-[#E8E5DE] px-4 py-2 text-center text-sm font-medium text-[#4F654F] transition hover:bg-[#FAF9F6]"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              );
            })
          )}
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

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
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
              ),
            )}

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
      </div>
    </div>
  );
}
