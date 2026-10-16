"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  getRoomById,
  updateRoom,
  deleteRoomImage,
} from "@/src/services/reservations.service";

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  imageUrl?: string | null;
  images?: {
    id: number;
    url: string;
  }[];
};

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [equipment, setEquipment] = useState("");

  const [currentImages, setCurrentImages] = useState<
    { id: number; url: string }[]
  >([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoom = async () => {
      const id = Number(params.id);

      if (!id) {
        setError("Identifiant de salle invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const room: Room = await getRoomById(id);

        setName(room.name);
        setCapacity(String(room.capacity));
        setLocation(room.location);
        setEquipment(room.equipment || "");

        if (room.images && room.images.length > 0) {
          setCurrentImages(
            room.images.filter(
              (image) =>
                image.id != null &&
                typeof image.url === "string" &&
                image.url.trim() !== "",
            ),
          );
        } else {
          setCurrentImages([]);
        }
      } catch (error) {
        console.error("Erreur récupération salle :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de récupérer la salle.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [params.id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    const totalImages = images.length + selectedFiles.length;

    if (totalImages > 10) {
      setError("Vous pouvez ajouter maximum 10 nouvelles photos.");
      return;
    }

    setError("");

    setImages((previousImages) => [...previousImages, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setImagePreviews((previousPreviews) => [
      ...previousPreviews,
      ...newPreviews,
    ]);

    event.target.value = "";
  };

  const handleDeleteCurrentImage = async (imageId: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette photo ? Cette action est définitive.",
    );

    if (!confirmed) return;

    setError("");
    setDeletingImageId(imageId);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Vous devez être connecté pour supprimer une photo.");
      }

      await deleteRoomImage(token, Number(params.id), imageId);

      setCurrentImages((previousImages) =>
        previousImages.filter((image) => image.id !== imageId),
      );
    } catch (error) {
      console.error("Erreur suppression photo :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la photo.",
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Vous devez être connecté pour modifier une salle.");
      }

      if (!name.trim()) {
        throw new Error("Le nom de la salle est obligatoire.");
      }

      if (!capacity || Number(capacity) < 1) {
        throw new Error("La capacité doit être supérieure à 0.");
      }

      if (!location.trim()) {
        throw new Error("L'emplacement est obligatoire.");
      }

      await updateRoom(token, Number(params.id), {
        name: name.trim(),
        capacity: Number(capacity),
        location: location.trim(),
        equipment: equipment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      router.push("/dashboard/admin/salles");
    } catch (error) {
      console.error("Erreur modification salle :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la salle.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-500">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/admin/salles"
          className="text-sm text-gray-500 transition hover:text-[#5F765F]"
        >
          ← Retour à la gestion des salles
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Modifier la salle</h1>

          <p className="mt-2 text-sm text-gray-500">
            Modifiez les informations de la salle.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-lg border border-[#E8E5DE] bg-white p-5 sm:p-6"
        >
          {/* Nom */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold">
              Nom de la salle
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
              required
            />
          </div>

          {/* Capacité */}
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block text-sm font-semibold"
            >
              Capacité
            </label>

            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
              required
            />
          </div>

          {/* Localisation */}
          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold"
            >
              Localisation
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
              required
            />
          </div>

          {/* Équipements */}
          <div>
            <label
              htmlFor="equipment"
              className="mb-2 block text-sm font-semibold"
            >
              Équipements
            </label>

            <textarea
              id="equipment"
              value={equipment}
              onChange={(event) => setEquipment(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
            />
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Photos de la salle
            </label>

            {/* Photos déjà enregistrées */}
            {currentImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Photos actuelles
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {currentImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative h-36 overflow-hidden rounded-md border border-[#E8E5DE] bg-[#FAF9F6] sm:h-40"
                    >
                      <Image
                        src={image.url}
                        alt={`Photo actuelle ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 320px"
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteCurrentImage(image.id)}
                        disabled={deletingImageId !== null || isSaving}
                        aria-label={`Supprimer la photo ${index + 1}`}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#4F654F] text-lg font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingImageId === image.id ? "…" : "×"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Nouvelles photos
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) =>
                    preview ? (
                      <div
                        key={preview}
                        className="relative h-36 overflow-hidden rounded-md border border-[#E8E5DE] bg-[#FAF9F6] sm:h-40"
                      >
                        <Image
                          src={preview}
                          alt={`Nouvelle photo ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 320px"
                          className="object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setImages((previousImages) =>
                              previousImages.filter(
                                (_, imageIndex) => imageIndex !== index,
                              ),
                            );

                            setImagePreviews((previousPreviews) =>
                              previousPreviews.filter(
                                (_, previewIndex) => previewIndex !== index,
                              ),
                            );
                          }}
                          className="absolute right-2 top-2 rounded-full bg-[#4F654F] px-2 py-1 text-xs font-semibold text-white transition hover:bg-[#5F765F]"
                        >
                          ×
                        </button>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Bouton ajouter */}
            <label
              htmlFor="images"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#E8E5DE] px-4 py-6 text-center text-sm font-semibold text-[#5F765F] transition hover:border-[#5F765F] hover:bg-[#FAF9F6]"
            >
              <span className="text-lg">＋</span>

              <span>
                {images.length > 0
                  ? "Ajouter d'autres photos"
                  : "Ajouter des photos"}
              </span>
            </label>

            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <p className="mt-2 text-xs text-gray-500">
              Vous pouvez sélectionner plusieurs photos à la fois. Maximum 10
              nouvelles photos.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/admin/salles"
              className="flex-1 rounded-md border border-[#E8E5DE] py-3 text-center text-sm font-semibold text-[#4F654F] transition hover:bg-[#FAF9F6]"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
