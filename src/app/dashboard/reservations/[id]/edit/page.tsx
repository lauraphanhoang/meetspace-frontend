"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  getReservationById,
  getRooms,
  updateReservation,
} from "@/src/services/reservations.service";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
};

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  room: Room;
};

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hours = Array.from({ length: 14 }, (_, index) => {
    const hour = index + 7;
    return `${hour.toString().padStart(2, "0")}:`;
  });

  const minutes = ["00", "15", "30", "45"];

  const timeSlots = hours.flatMap((hour) =>
    minutes.map((minute) => `${hour}${minute}`),
  );

  const reservationId = Number(params.id);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const getTodayForInput = () => {
    return formatDateForInput(new Date());
  };

  useEffect(() => {
    let cancelled = false;

    const loadReservation = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) {
          setError("Vous devez être connecté pour modifier cette réservation.");
          setIsLoading(false);
          setIsLoadingRooms(false);
        }
        return;
      }

      if (!Number.isInteger(reservationId) || reservationId <= 0) {
        if (!cancelled) {
          setError("Identifiant de réservation invalide.");
          setIsLoading(false);
          setIsLoadingRooms(false);
        }
        return;
      }

      try {
        const [reservationData, roomsData] = await Promise.all([
          getReservationById(token, reservationId),
          getRooms(),
        ]);

        if (cancelled) return;

        const now = new Date();
        const reservationEndDate = new Date(reservationData.endDate);

        // Une réservation terminée ne peut pas être modifiée
        if (reservationEndDate < now) {
          setReservation(reservationData);
          setRooms(roomsData);
          setError(
            "Cette réservation est terminée et ne peut plus être modifiée.",
          );
          setIsLoading(false);
          setIsLoadingRooms(false);
          return;
        }

        setReservation(reservationData);
        setRooms(roomsData);

        const start = new Date(reservationData.startDate);
        const end = new Date(reservationData.endDate);

        setRoomId(String(reservationData.room.id));

        setStartDate(formatDateForInput(start));
        setStartTime(formatTimeForInput(start));

        setEndDate(formatDateForInput(end));
        setEndTime(formatTimeForInput(end));

        setIsLoading(false);
        setIsLoadingRooms(false);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération données :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la réservation.",
        );

        setIsLoading(false);
        setIsLoadingRooms(false);
      }
    };

    loadReservation();

    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Vous devez être connecté pour modifier cette réservation.",
        );
      }

      if (!reservation) {
        throw new Error("Réservation introuvable.");
      }

      if (!roomId) {
        throw new Error("Veuillez sélectionner une salle.");
      }

      if (!startDate || !startTime || !endDate || !endTime) {
        throw new Error("Veuillez renseigner les dates et heures.");
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const now = new Date();

      if (startDateTime < now) {
        throw new Error(
          "La date et l'heure de début ne peuvent pas être dans le passé.",
        );
      }

      if (endDateTime <= startDateTime) {
        throw new Error("La date de fin doit être après la date de début.");
      }

      await updateReservation(token, reservationId, {
        roomId: Number(roomId),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });

      setSuccess("Votre réservation a été modifiée avec succès.");

      setTimeout(() => {
        router.push(`/dashboard/reservations/${reservationId}`);
      }, 1000);
    } catch (error) {
      console.error("Erreur modification réservation :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la réservation.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]";

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-500">
            Chargement de la réservation...
          </p>
        </div>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-[#E8E5DE] bg-white p-6">
            <p className="text-sm text-red-600">{error}</p>

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

  const isCompleted = reservation
    ? new Date(reservation.endDate) < new Date()
    : false;

  if (isCompleted) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-[#E8E5DE] bg-white p-6">
            <p className="text-sm text-gray-600">
              Cette réservation est terminée et ne peut plus être modifiée.
            </p>

            <Link
              href={`/dashboard/reservations/${reservationId}`}
              className="mt-6 inline-block text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
            >
              ← Retour à la réservation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/dashboard/reservations/${reservationId}`}
          className="text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
        >
          ← Retour à la réservation
        </Link>

        <h1 className="mt-6 text-2xl font-bold">Modifier la réservation</h1>

        <p className="mt-2 text-sm text-gray-500">
          Modifiez les informations de votre réservation.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6"
        >
          {/* Salle */}
          <div>
            <label htmlFor="room" className="mb-2 block text-sm font-semibold">
              Salle
            </label>

            <select
              id="room"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className={inputClassName}
              disabled={isLoadingRooms}
              required
            >
              <option value="">
                {isLoadingRooms
                  ? "Chargement des salles..."
                  : "Sélectionnez une salle"}
              </option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date et heure de début */}
          <div>
            <label
              htmlFor="startDate"
              className="mb-2 block text-sm font-semibold"
            >
              Date et heure de début
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="startDate"
                type="date"
                value={startDate}
                min={getTodayForInput()}
                onChange={(event) => setStartDate(event.target.value)}
                className={`flex-1 ${inputClassName}`}
                required
              />

              <select
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className={`flex-1 ${inputClassName}`}
                required
              >
                <option value="">Heure</option>

                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date et heure de fin */}
          <div>
            <label
              htmlFor="endDate"
              className="mb-2 block text-sm font-semibold"
            >
              Date et heure de fin
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || getTodayForInput()}
                onChange={(event) => setEndDate(event.target.value)}
                className={`flex-1 ${inputClassName}`}
                required
              />

              <select
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className={`flex-1 ${inputClassName}`}
                required
              >
                <option value="">Heure</option>

                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-[#E8EEE6] px-4 py-3">
              <p className="text-sm font-medium text-[#4F654F]">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || isLoadingRooms}
            className="w-full rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}
