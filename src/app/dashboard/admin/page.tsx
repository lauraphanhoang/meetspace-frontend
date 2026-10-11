"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, DoorOpen, ArrowRight, Users } from "lucide-react";

import {
  getRooms,
  getAllReservations,
  getUsers,
} from "@/src/services/reservations.service";

import AdminGuard from "@/src/components/auth/AdminGuard";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
};

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
};

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
    imageUrl?: string | null;
    images?: {
      id: number;
      url: string;
    }[];
  };
};

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté.");
        setIsLoading(false);
        return;
      }

      try {
        const [roomsData, reservationsData, usersData] = await Promise.all([
          getRooms(),
          getAllReservations(token),
          getUsers(token),
        ]);

        setRooms(roomsData);
        setReservations(reservationsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur chargement dashboard admin :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger le dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const now = new Date();

  const upcomingReservations = reservations.filter(
    (reservation) => new Date(reservation.startDate) > now,
  );

  const currentReservations = reservations.filter((reservation) => {
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);

    return startDate <= now && now <= endDate;
  });

  const sortedReservations = [...reservations].sort((a, b) => {
    const now = new Date().getTime();

    const aStart = new Date(a.startDate).getTime();
    const bStart = new Date(b.startDate).getTime();

    const aEnd = new Date(a.endDate).getTime();
    const bEnd = new Date(b.endDate).getTime();

    const aCompleted = aEnd < now;
    const bCompleted = bEnd < now;

    // Réservations à venir / en cours avant les réservations terminées
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    // Parmi les réservations actives ou à venir :
    // la plus proche dans le temps en premier
    if (!aCompleted && !bCompleted) {
      return aStart - bStart;
    }

    // Parmi les réservations terminées :
    // la plus récemment terminée en premier
    return bEnd - aEnd;
  });

  const latestReservations = sortedReservations.slice(0, 3);

  // Calcul du nombre de réservations par salle
  const roomReservationCounts = reservations.reduce(
    (acc, reservation) => {
      const roomId = reservation.room.id;

      if (!acc[roomId]) {
        acc[roomId] = {
          id: roomId,
          name: reservation.room.name,
          count: 0,
        };
      }

      acc[roomId].count += 1;

      return acc;
    },
    {} as Record<
      number,
      {
        id: number;
        name: string;
        count: number;
      }
    >,
  );

  // Classement des 3 salles les plus réservées
  const mostReservedRooms = Object.values(roomReservationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

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

  const getRoomImage = (room: Reservation["room"]) => {
    return room.images?.[0]?.url || room.imageUrl || null;
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-sm text-gray-500">Chargement du dashboard...</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <h1 className="text-2xl font-bold">
              Tableau de bord administrateur
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Gérez les salles et consultez les réservations.
            </p>
          </div>

          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {/* Salles */}
            <div className="aspect-[1.7] rounded-lg border border-[#E5DED0] p-3 sm:aspect-auto sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Salles</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6]">
                  <DoorOpen size={18} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold">{rooms.length}</p>

              <p className="mt-1 text-xs text-gray-500">salles disponibles</p>
            </div>

            {/* Réservations */}
            <div className="aspect-[1.7] rounded-lg border border-[#E5DED0] p-3 sm:aspect-auto sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Réservations</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6]">
                  <CalendarDays size={18} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold">{reservations.length}</p>

              <p className="mt-1 text-xs text-gray-500">
                réservations au total
              </p>
            </div>

            {/* À venir */}
            <div className="aspect-[1.7] rounded-lg border border-[#E5DED0] p-3 sm:aspect-auto sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">À venir</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6]">
                  <Clock size={18} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold">
                {upcomingReservations.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">réservations à venir</p>
            </div>

            {/* En cours */}
            <div className="aspect-[1.7] rounded-lg border border-[#E5DED0] p-3 sm:aspect-auto sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">En cours</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6]">
                  <Clock size={18} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold">
                {currentReservations.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                réservation(s) actuellement
              </p>
            </div>

            {/* Utilisateurs */}
            <div className="aspect-[1.7] rounded-lg border border-[#E5DED0] p-3 sm:aspect-auto sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Utilisateurs</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6]">
                  <Users size={18} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold">{users.length}</p>

              <p className="mt-1 text-xs text-gray-500">
                utilisateurs inscrits
              </p>
            </div>
          </div>

          {/* Dernières réservations */}
          <div className="mt-8 rounded-lg border border-[#E5DED0]">
            <div className="flex flex-col gap-4 border-b border-[#E5DED0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="font-semibold">Dernières réservations</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Les réservations les plus récentes.
                </p>
              </div>

              <Link
                href="/dashboard/admin/reservations"
                className="flex items-center gap-2 text-sm font-medium text-[#5F765F] hover:text-[#4F654F] hover:underline"
              >
                Voir toutes
                <ArrowRight size={16} />
              </Link>
            </div>

            {latestReservations.length === 0 ? (
              <div className="px-5 py-8 text-center sm:px-6">
                <p className="text-sm text-gray-500">
                  Aucune réservation enregistrée.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E5DED0] bg-[#F7F3EA]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Salle</th>

                      <th className="px-6 py-4 font-semibold">Utilisateur</th>

                      <th className="px-6 py-4 font-semibold">Date</th>

                      <th className="px-6 py-4 font-semibold">Horaire</th>

                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {latestReservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#F7F3EA]"
                      >
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                              {getRoomImage(reservation.room) ? (
                                <Image
                                  src={getRoomImage(reservation.room)!}
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

                        <td className="px-6 py-4">
                          {formatDate(reservation.startDate)}
                        </td>

                        <td className="px-6 py-4">
                          {formatTime(reservation.startDate)} -{" "}
                          {formatTime(reservation.endDate)}
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/admin/reservations/${reservation.id}`}
                            className="font-medium text-[#5F765F] hover:text-[#4F654F] hover:underline"
                          >
                            Voir →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Salles les plus réservées */}
          <div className="mt-8 rounded-lg border border-[#E5DED0]">
            <div className="border-b border-[#E5DED0] px-5 py-5 sm:px-6">
              <h2 className="font-semibold">Salles les plus réservées</h2>

              <p className="mt-1 text-sm text-gray-500">
                Les salles ayant enregistré le plus de réservations.
              </p>
            </div>

            {mostReservedRooms.length === 0 ? (
              <div className="px-5 py-8 text-center sm:px-6">
                <p className="text-sm text-gray-500">
                  Aucune réservation enregistrée.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {mostReservedRooms.map((room, index) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between px-5 py-4 sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEE6] text-sm font-semibold text-[#5F765F]">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium">{room.name}</p>

                        <p className="text-sm text-gray-500">
                          {room.count}{" "}
                          {room.count > 1 ? "réservations" : "réservation"}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm font-medium">{room.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/admin/salles"
              className="rounded-lg border border-[#E5DED0] p-5 transition hover:bg-[#F7F3EA] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Gérer les salles</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Ajouter, modifier ou supprimer une salle.
                  </p>
                </div>

                <ArrowRight size={20} className="text-[#5F765F]" />
              </div>
            </Link>

            <Link
              href="/dashboard/admin/reservations"
              className="rounded-lg border border-[#E5DED0] p-5 transition hover:bg-[#F7F3EA] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Gérer les réservations</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Consulter toutes les réservations.
                  </p>
                </div>

                <ArrowRight size={20} className="text-[#5F765F]" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
