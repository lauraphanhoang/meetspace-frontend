"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { getProfile } from "@/src/services/auth.service";
import {
  getMyReservations,
  getRooms,
} from "@/src/services/reservations.service";

type User = {
  firstname: string;
  lastname: string;
  email: string;
};

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  userId: number;
  roomId: number;
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const [profile, reservationsData, roomsData] = await Promise.all([
          getProfile(token),
          getMyReservations(token),
          getRooms(),
        ]);

        if (cancelled) return;

        setUser(profile);
        setReservations(reservationsData);
        setRoomsCount(roomsData.length);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération dashboard :", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();

  const upcomingReservations = reservations
    .filter((reservation) => {
      return new Date(reservation.endDate) >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

  const pastReservations = reservations.filter((reservation) => {
    return new Date(reservation.endDate) < now;
  });

  const totalReservations = reservations.length;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-[#1F2A24]">
            Bienvenue
            {user ? `, ${user.firstname} ${user.lastname}` : ""}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Retrouvez ici un aperçu de vos réservations.
          </p>
        </div>

        {/* Statistiques */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-[#E8E5DE] bg-white px-4 py-5 text-center">
            <span className="text-2xl font-bold text-[#5F765F]">
              {isLoading ? "..." : upcomingReservations.length}
            </span>

            <span className="mt-2 max-w-28 text-sm font-medium leading-tight text-[#1F2A24]">
              Réservations à venir
            </span>
          </div>

          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-[#E8E5DE] bg-white px-4 py-5 text-center">
            <span className="text-2xl font-bold text-[#5F765F]">
              {isLoading ? "..." : pastReservations.length}
            </span>

            <span className="mt-2 max-w-28 text-sm font-medium leading-tight text-[#1F2A24]">
              Réservations terminées
            </span>
          </div>

          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-[#E8E5DE] bg-white px-4 py-5 text-center">
            <span className="text-2xl font-bold text-[#5F765F]">
              {isLoading ? "..." : totalReservations}
            </span>

            <span className="mt-2 max-w-28 text-sm font-medium leading-tight text-[#1F2A24]">
              Total des réservations
            </span>
          </div>

          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-[#E8E5DE] bg-white px-4 py-5 text-center">
            <span className="text-2xl font-bold text-[#5F765F]">
              {isLoading ? "..." : roomsCount}
            </span>

            <span className="mt-2 max-w-28 text-sm font-medium leading-tight text-[#1F2A24]">
              Salles disponibles
            </span>
          </div>
        </section>

        {/* Prochaines réservations */}
        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[#1F2A24]">
              Prochaines réservations
            </h2>

            <Link
              href="/dashboard/reservations"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E8E5DE] px-5 py-3 text-sm font-medium text-[#4F654F] transition hover:bg-[#FAF9F6] sm:w-auto"
            >
              Voir toutes
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">
                Chargement des réservations...
              </p>
            ) : upcomingReservations.length === 0 ? (
              <div className="rounded-xl border border-[#E8E5DE] bg-white px-5 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Vous n&apos;avez aucune réservation à venir.
                </p>
              </div>
            ) : (
              upcomingReservations.slice(0, 3).map((reservation) => (
                <Link
                  key={reservation.id}
                  href={`/dashboard/reservations/${reservation.id}`}
                  className="flex flex-col gap-4 rounded-xl border border-[#E8E5DE] bg-white p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4"
                >
                  {/* Image */}
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-md bg-[#FAF9F6] sm:h-16 sm:w-16">
                    {reservation.room.images?.[0]?.url ? (
                      <Image
                        src={reservation.room.images[0].url}
                        alt={reservation.room.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Aucune image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#1F2A24] transition hover:text-[#5F765F]">
                      {reservation.room.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {new Date(reservation.startDate).toLocaleDateString(
                        "fr-FR",
                      )}{" "}
                      -{" "}
                      {new Date(reservation.endDate).toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                  </div>

                  <span className="w-fit rounded-md bg-[#E8EEE6] px-4 py-2 text-sm font-medium text-[#4F654F]">
                    Confirmée
                  </span>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/dashboard/reservation"
            className="mt-5 flex w-full items-center justify-center rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] sm:py-4"
          >
            + Nouvelle réservation
          </Link>
        </section>
      </div>
    </div>
  );
}
