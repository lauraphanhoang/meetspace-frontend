"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createReservation,
  getRoomAvailability,
  getRooms,
} from "@/src/services/reservations.service";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
};

type ExistingReservation = {
  startDate: string;
  endDate: string;
};

export default function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get("roomId");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [existingReservations, setExistingReservations] = useState<
    ExistingReservation[]
  >([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  /* Créneaux disponibles : par tranches de 30 minutes */
  const hours = Array.from({ length: 14 }, (_, index) => {
    const hour = index + 7;
    return `${hour.toString().padStart(2, "0")}:`;
  });

  const minutes = ["00", "30"];

  const timeSlots = hours.flatMap((hour) =>
    minutes.map((minute) => `${hour}${minute}`),
  );

  /* Retourne la date d'aujourd'hui au format YYYY-MM-DD */
  const getTodayDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* Vérifie si un créneau est déjà passé ou déjà réservé. */
  const isTimeSlotOccupied = (time: string, date: string) => {
    if (!date) return false;

    const now = new Date();

    const slotStart = new Date(`${date}T${time}`);

    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

    /*Si la date sélectionnée est aujourd'hui, on désactive les créneaux déjà passés. */
    if (date === getTodayDate() && slotStart <= now) {
      return true;
    }

    /* Vérification des réservations existantes. */
    return existingReservations.some((reservation) => {
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);

      return slotStart < reservationEnd && slotEnd > reservationStart;
    });
  };

  /* Récupération des salles */
  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      try {
        const data = await getRooms();

        if (cancelled) return;

        console.log("Salles récupérées :", data);
        setRooms(data);

        if (roomIdFromUrl) {
          const roomExists = data.some(
            (room: Room) => room.id === Number(roomIdFromUrl),
          );

          if (roomExists) {
            setRoomId(roomIdFromUrl);
          }
        }
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
          setIsLoadingRooms(false);
        }
      }
    };

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, [roomIdFromUrl]);

  /* Chargement automatique des disponibilités dès que la salle ou la date de début change. */
  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      if (!roomId || !startDate) {
        if (!cancelled) {
          setExistingReservations([]);
        }
        return;
      }

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error(
            "Vous devez être connecté pour consulter les disponibilités.",
          );
        }

        if (!cancelled) {
          setIsLoadingAvailability(true);
        }

        const reservations = await getRoomAvailability(
          token,
          Number(roomId),
          startDate,
        );

        if (!cancelled) {
          setExistingReservations(reservations);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération disponibilités :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les disponibilités.",
        );

        setExistingReservations([]);
      } finally {
        if (!cancelled) {
          setIsLoadingAvailability(false);
        }
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [roomId, startDate]);

  /* Création de la réservation */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Vous devez être connecté pour effectuer une réservation.",
        );
      }

      if (!roomId) {
        throw new Error("Veuillez sélectionner une salle.");
      }

      if (!startDate || !startTime || !endDate || !endTime) {
        throw new Error("Veuillez renseigner les dates et heures.");
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);

      const endDateTime = new Date(`${endDate}T${endTime}`);

      /* Vérification de la cohérence des dates */
      if (endDateTime <= startDateTime) {
        throw new Error("La date de fin doit être après la date de début.");
      }

      /* Vérification d'un conflit avec une réservation déjà existante. */
      const reservationStart = new Date(`${startDate}T${startTime}`);

      const reservationEnd = new Date(`${endDate}T${endTime}`);

      const hasConflict = existingReservations.some((reservation) => {
        const existingStart = new Date(reservation.startDate);

        const existingEnd = new Date(reservation.endDate);

        return reservationStart < existingEnd && reservationEnd > existingStart;
      });

      if (hasConflict) {
        throw new Error(
          "La plage sélectionnée contient un créneau déjà réservé.",
        );
      }

      /* Création de la réservation */
      const result = await createReservation(token, {
        roomId: Number(roomId),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });

      console.log("Réservation créée :", result);

      setSuccess("Votre réservation a été créée avec succès.");

      setRoomId("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setExistingReservations([]);

      setTimeout(() => {
        router.push("/dashboard/reservations");
      }, 1000);
    } catch (error) {
      console.error("Erreur création réservation :", error);

      setError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* Date minimale : aujourd'hui */
  const getMinDate = () => {
    return getTodayDate();
  };

  const inputClassName =
    "w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]";

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Nouvelle réservation</h1>

        <p className="mt-2 text-sm text-gray-500">
          Sélectionnez une salle et choisissez votre créneau.
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
              onChange={(event) => {
                setRoomId(event.target.value);
                setStartTime("");
                setEndTime("");
                setError("");
              }}
              className={inputClassName}
              required
            >
              <option value="">Sélectionnez une salle</option>

              {isLoadingRooms ? (
                <option value="">Chargement des salles...</option>
              ) : rooms.length === 0 ? (
                <option value="">Aucune salle disponible</option>
              ) : (
                rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))
              )}
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
                min={getMinDate()}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setStartTime("");
                  setEndTime("");
                  setError("");
                }}
                className={`flex-1 ${inputClassName}`}
                required
              />

              <select
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  setEndTime("");
                  setError("");
                }}
                className={`flex-1 ${inputClassName}`}
                required
                disabled={!startDate || !roomId || isLoadingAvailability}
              >
                <option value="">
                  {isLoadingAvailability ? "Chargement..." : "Heure"}
                </option>

                {timeSlots.map((time) => {
                  const occupied = isTimeSlotOccupied(time, startDate);

                  return (
                    <option key={time} value={time} disabled={occupied}>
                      {time}
                      {occupied ? " — Occupé" : ""}
                    </option>
                  );
                })}
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
                min={startDate || getMinDate()}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setEndTime("");
                  setError("");
                }}
                className={`flex-1 ${inputClassName}`}
                required
              />

              <select
                value={endTime}
                onChange={(event) => {
                  setEndTime(event.target.value);
                  setError("");
                }}
                className={`flex-1 ${inputClassName}`}
                required
                disabled={!endDate || !roomId || isLoadingAvailability}
              >
                <option value="">
                  {isLoadingAvailability ? "Chargement..." : "Heure"}
                </option>

                {timeSlots.map((time) => {
                  const occupied = isTimeSlotOccupied(time, endDate);

                  return (
                    <option key={time} value={time} disabled={occupied}>
                      {time}
                      {occupied ? " — Occupé" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Information disponibilités */}
          {isLoadingAvailability && (
            <div className="rounded-md bg-[#FAF9F6] px-4 py-3">
              <p className="text-sm text-gray-500">
                Chargement des créneaux disponibles...
              </p>
            </div>
          )}

          {!isLoadingAvailability &&
            roomId &&
            startDate &&
            existingReservations.length > 0 && (
              <div className="rounded-md bg-[#FAF9F6] px-4 py-3">
                <p className="text-sm text-gray-600">
                  Les créneaux déjà réservés sont désactivés.
                </p>
              </div>
            )}

          {!isLoadingAvailability &&
            roomId &&
            startDate &&
            existingReservations.length === 0 && (
              <div className="rounded-md bg-[#E8EEE6] px-4 py-3">
                <p className="text-sm font-medium text-[#4F654F]">
                  Tous les créneaux sont disponibles pour cette journée.
                </p>
              </div>
            )}

          {/* Erreur */}
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="rounded-md bg-[#E8EEE6] px-4 py-3">
              <p className="text-sm font-medium text-[#4F654F]">{success}</p>
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={isLoading || isLoadingRooms || isLoadingAvailability}
            className="w-full rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Création en cours..." : "Confirmer la réservation"}
          </button>
        </form>
      </div>
    </div>
  );
}
