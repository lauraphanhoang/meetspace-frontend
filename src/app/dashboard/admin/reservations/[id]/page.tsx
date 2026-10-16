"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import AdminGuard from "@/src/components/auth/AdminGuard";
import { getAdminReservationById } from "@/src/services/reservations.service";

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
    images?: {
      id: number;
      url: string;
    }[];
  };
};

export default function AdminReservationDetailsPage() {
  const params = useParams();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const loadReservation = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté.");
        setIsLoading(false);
        return;
      }

      const id = Number(params.id);

      if (!id) {
        setError("Identifiant de réservation invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAdminReservationById(token, id);
        setReservation(data);
      } catch (error) {
        console.error("Erreur récupération réservation :", error);
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la réservation.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReservation();
  }, [params.id]);

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

  const getStatus = () => {
    if (!reservation) return "";

    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);

    if (endDate < now) return "Terminée";
    if (startDate <= now && now <= endDate) return "En cours";
    return "À venir";
  };

  const status = getStatus();

  const roomImages =
    reservation?.room.images?.filter(
      (image) => typeof image.url === "string" && image.url.trim() !== "",
    ) ?? [];

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-gray-500">
              Chargement de la réservation...
            </p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (error || !reservation) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-red-600">
              {error || "Réservation introuvable."}
            </p>

            <Link
              href="/dashboard/admin/reservations"
              className="mt-6 inline-block text-sm font-medium text-[#5F765F] hover:text-[#4F654F] hover:underline"
            >
              ← Retour aux réservations
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/admin/reservations"
            className="text-sm text-gray-500 transition hover:text-[#5F765F]"
          >
            ← Retour aux réservations
          </Link>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{reservation.room.name}</h1>

              <p className="mt-2 text-sm text-gray-500">
                Réservation #{reservation.id}
              </p>
            </div>

            <span
              className={`w-fit rounded-md px-4 py-2 text-sm font-medium ${
                status === "En cours"
                  ? "bg-[#E8EEE6] text-[#4F654F]"
                  : status === "À venir"
                    ? "bg-[#FAF9F6] text-[#5F765F]"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Informations de la réservation */}
          <div className="mt-8 rounded-lg border border-[#E8E5DE] bg-white p-6">
            <h2 className="text-lg font-semibold">
              Informations de la réservation
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Date</p>

                <p className="mt-1 font-medium">
                  {formatDate(reservation.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Horaire</p>

                <p className="mt-1 font-medium">
                  {formatTime(reservation.startDate)} -{" "}
                  {formatTime(reservation.endDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Salle</p>

                <p className="mt-1 font-medium">{reservation.room.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Localisation</p>

                <p className="mt-1 font-medium">{reservation.room.location}</p>
              </div>
            </div>
          </div>

          {/* Utilisateur */}
          <div className="mt-6 rounded-lg border border-[#E8E5DE] bg-white p-6">
            <h2 className="text-lg font-semibold">Utilisateur</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>

                <p className="mt-1 font-medium">
                  {reservation.user.firstname} {reservation.user.lastname}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="mt-1 font-medium">{reservation.user.email}</p>
              </div>
            </div>
          </div>

          {/* Informations de la salle */}
          <div className="mt-6 rounded-lg border border-[#E8E5DE] bg-white p-6">
            <h2 className="text-lg font-semibold">Informations de la salle</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Capacité</p>

                <p className="mt-1 font-medium">
                  {reservation.room.capacity} personnes
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Équipements</p>

                <p className="mt-1 font-medium">
                  {reservation.room.equipment || "Aucun équipement renseigné"}
                </p>
              </div>

              {roomImages.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-gray-500">Photos</p>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {roomImages.slice(0, 3).map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className="group relative h-40 overflow-hidden rounded-lg bg-[#FAF9F6]"
                      >
                        <Image
                          src={image.url}
                          alt={`${reservation.room.name} - photo ${index + 1}`}
                          width={400}
                          height={300}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />

                        {index === 2 && roomImages.length > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-lg font-semibold text-white">
                              +{roomImages.length - 3} photo
                              {roomImages.length - 3 > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Galerie plein écran */}
        {selectedImageIndex !== null && reservation.room.images && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            onClick={() => setSelectedImageIndex(null)}
          >
            {(() => {
              if (!roomImages[selectedImageIndex]) return null;

              return (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute right-6 top-6 text-3xl text-white transition hover:opacity-70"
                    aria-label="Fermer"
                  >
                    ×
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) =>
                        current !== null
                          ? (current - 1 + roomImages.length) %
                            roomImages.length
                          : null,
                      );
                    }}
                    className="absolute left-6 text-4xl text-white transition hover:opacity-70"
                    aria-label="Photo précédente"
                  >
                    ‹
                  </button>

                  <div
                    className="max-h-[85vh] max-w-5xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Image
                      src={roomImages[selectedImageIndex].url}
                      alt={`${reservation.room.name} - photo ${selectedImageIndex + 1}`}
                      width={1200}
                      height={800}
                      className="max-h-[85vh] max-w-full rounded-lg object-contain"
                    />

                    <p className="mt-3 text-center text-sm text-white">
                      {selectedImageIndex + 1} / {roomImages.length}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedImageIndex((current) =>
                        current !== null
                          ? (current + 1) % roomImages.length
                          : null,
                      );
                    }}
                    className="absolute right-6 text-4xl text-white transition hover:opacity-70"
                    aria-label="Photo suivante"
                  >
                    ›
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
