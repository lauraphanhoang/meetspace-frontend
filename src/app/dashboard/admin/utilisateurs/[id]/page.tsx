"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, Shield, User } from "lucide-react";
import { useParams } from "next/navigation";

import { getUserById } from "@/src/services/reservations.service";
import AdminGuard from "@/src/components/auth/AdminGuard";

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  room: {
    id: number;
    name: string;
  };
};

type UserDetails = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  createdAt: string;
  reservations: Reservation[];
};

const RESERVATIONS_PER_PAGE = 5;

export default function AdminUserDetailsPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté.");
        setIsLoading(false);
        return;
      }

      if (!userId || Number.isNaN(userId)) {
        setError("Utilisateur introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserById(token, userId);

        setUser(data);
        setCurrentPage(1);
      } catch (error) {
        console.error("Erreur chargement utilisateur :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger l'utilisateur.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalReservations = user?.reservations.length ?? 0;

  const totalPages = Math.ceil(totalReservations / RESERVATIONS_PER_PAGE);

  const startIndex = (currentPage - 1) * RESERVATIONS_PER_PAGE;

  const displayedReservations =
    user?.reservations.slice(startIndex, startIndex + RESERVATIONS_PER_PAGE) ??
    [];

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-sm text-gray-500">
            Chargement de l&apos;utilisateur...
          </p>
        </div>
      </AdminGuard>
    );
  }

  if (error || !user) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/dashboard/admin/utilisateurs"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
            >
              <ArrowLeft size={16} />
              Retour aux utilisateurs
            </Link>

            <p className="mt-8 text-sm text-red-600">
              {error || "Utilisateur introuvable."}
            </p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Retour */}
          <Link
            href="/dashboard/admin/utilisateurs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
          >
            <ArrowLeft size={16} />
            Retour aux utilisateurs
          </Link>

          {/* En-tête utilisateur */}
          <div className="mt-6 flex flex-col gap-6 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8EEE6] text-xl font-semibold text-[#4F654F]">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.firstname} ${user.lastname}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {user.firstname.charAt(0)}
                  {user.lastname.charAt(0)}
                </>
              )}
            </div>

            {/* Informations principales */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {user.firstname} {user.lastname}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-[#E8EEE6] text-[#4F654F]"
                      : "bg-[#FAF9F6] text-[#6F756F]"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Mail size={16} />
                <span className="break-all">{user.email}</span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Membre depuis le {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Réservations</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EEE6]">
                  <CalendarDays size={20} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold">
                {user.reservations.length}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                réservation
                {user.reservations.length > 1 ? "s" : ""} enregistrée
                {user.reservations.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Rôle</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EEE6]">
                  <Shield size={20} className="text-[#5F765F]" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold">{user.role}</p>

              <p className="mt-1 text-sm text-gray-500">
                Niveau d&apos;accès du compte
              </p>
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="mt-8 overflow-hidden rounded-xl border border-[#E8E5DE] bg-white">
            <div className="border-b border-[#E8E5DE] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8EEE6]">
                  <User size={18} className="text-[#5F765F]" />
                </div>

                <h2 className="font-semibold">Informations utilisateur</h2>
              </div>
            </div>

            <div className="grid gap-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="mt-1 font-medium">{user.firstname}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="mt-1 font-medium">{user.lastname}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="mt-1 break-all font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="mt-1 font-medium">{user.role}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date d&apos;inscription</p>

                <p className="mt-1 font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Historique des réservations */}
          <div className="mt-8 overflow-hidden rounded-xl border border-[#E8E5DE] bg-white">
            <div className="border-b border-[#E8E5DE] px-5 py-5 sm:px-6">
              <h2 className="font-semibold">Historique des réservations</h2>

              <p className="mt-1 text-sm text-gray-500">
                Les réservations effectuées par cet utilisateur.
              </p>
            </div>

            {user.reservations.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Cet utilisateur n&apos;a encore effectué aucune réservation.
                </p>
              </div>
            ) : (
              <>
                {/* Tableau */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead className="border-b border-[#E8E5DE] bg-[#FAF9F6]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Salle</th>

                        <th className="px-6 py-4 font-semibold">Date</th>

                        <th className="px-6 py-4 font-semibold">Horaire</th>

                        <th className="px-6 py-4 font-semibold">Réservée le</th>

                        <th className="px-6 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayedReservations.map((reservation) => (
                        <tr
                          key={reservation.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-[#FAF9F6]"
                        >
                          <td className="px-6 py-4 font-medium">
                            {reservation.room.name}
                          </td>

                          <td className="px-6 py-4">
                            {formatDate(reservation.startDate)}
                          </td>

                          <td className="px-6 py-4">
                            {formatTime(reservation.startDate)} -{" "}
                            {formatTime(reservation.endDate)}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {formatDateTime(reservation.createdAt)}
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
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-6">
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
      </div>
    </AdminGuard>
  );
}
