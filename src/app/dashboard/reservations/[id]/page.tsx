"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  deleteReservation,
  getReservationById,
} from "@/src/services/reservations.service";

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

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const loadReservation = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté pour voir cette réservation.");
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
        const data = await getReservationById(token, id);
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

    if (endDate < now) {
      return "Terminée";
    }

    if (startDate <= now && now <= endDate) {
      return "En cours";
    }

    return "À venir";
  };

  const getStatusClassName = () => {
    const status = getStatus();

    if (status === "En cours") {
      return "bg-[#E8EEE6] text-[#4F654F]";
    }

    if (status === "À venir") {
      return "bg-[#FAF9F6] text-[#5F765F]";
    }

    return "bg-gray-100 text-gray-500";
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-gray-500">
            Chargement de la réservation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-[#E8E5DE] bg-white p-6">
            <p className="text-sm text-red-600">
              {error || "Réservation introuvable."}
            </p>

            <Link
              href="/dashboard/reservations"
              className="mt-6 inline-block text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
            >
              ← Retour à mes réservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir annuler cette réservation ?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    try {
      setError("");
      setIsDeleting(true);

      await deleteReservation(token, reservation.id);

      router.push("/dashboard/reservations");
    } catch (error) {
      console.error("Erreur annulation réservation :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'annuler la réservation.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Retour */}
        <Link
          href="/dashboard/reservations"
          className="text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
        >
          ← Retour à mes réservations
        </Link>

        {/* En-tête */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/dashboard/salles/${reservation.room.id}`}
              className="block break-words text-2xl font-bold text-[#1F2A24] transition hover:text-[#5F765F]"
            >
              {reservation.room.name}
            </Link>

            <p className="mt-2 text-sm text-gray-500">
              Détails de votre réservation
            </p>
          </div>

          <span
            className={`w-fit shrink-0 rounded-md px-4 py-2 text-sm font-medium ${getStatusClassName()}`}
          >
            {getStatus()}
          </span>
        </div>

        {/* Photos */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Photos de la salle</h2>

          <div className="mt-4">
            {reservation.room.images?.length > 0 ? (
              <div className="relative overflow-hidden rounded-xl bg-[#FAF9F6]">
                <div className="relative h-56 sm:h-72 lg:h-96">
                  <Image
                    src={reservation.room.images[currentImage].url}
                    alt={`${reservation.room.name} - photo ${currentImage + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {reservation.room.images.length > 1 && (
                  <>
                    {/* Photo précédente */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImage(
                          (currentImage - 1 + reservation.room.images.length) %
                            reservation.room.images.length,
                        )
                      }
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#4F654F] shadow transition hover:bg-white sm:left-4 sm:h-10 sm:w-10 sm:text-xl"
                      aria-label="Photo précédente"
                    >
                      ←
                    </button>

                    {/* Photo suivante */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImage(
                          (currentImage + 1) % reservation.room.images.length,
                        )
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#4F654F] shadow transition hover:bg-white sm:right-4 sm:h-10 sm:w-10 sm:text-xl"
                      aria-label="Photo suivante"
                    >
                      →
                    </button>

                    {/* Indicateurs */}
                    <div className="absolute bottom-3 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/50 px-3 py-2 sm:bottom-4">
                      {reservation.room.images.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setCurrentImage(index)}
                          className={`h-2 w-2 shrink-0 rounded-full transition ${
                            index === currentImage
                              ? "bg-white"
                              : "bg-white/50 hover:bg-white/80"
                          }`}
                          aria-label={`Afficher la photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-xl bg-[#FAF9F6] text-sm text-gray-400 sm:h-72 lg:h-96">
                Aucune photo disponible
              </div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            Informations de la réservation
          </h2>

          <div className="mt-6 space-y-5">
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
              <p className="text-sm text-gray-500">Localisation</p>

              <p className="mt-1 font-medium">{reservation.room.location}</p>
            </div>

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
          </div>
        </div>

        {/* Erreur annulation */}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        {getStatus() !== "Terminée" && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/reservations/${reservation.id}/edit`)
              }
              className="w-full rounded-md bg-[#5F765F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] sm:w-auto"
            >
              Modifier
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full rounded-md border border-[#E8E5DE] px-5 py-3 text-sm font-semibold text-[#4F654F] transition hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isDeleting ? "Annulation..." : "Annuler la réservation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
