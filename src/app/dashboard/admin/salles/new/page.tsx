"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { createRoom } from "@/src/services/reservations.service";

export default function NewRoomPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [equipment, setEquipment] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    // Vérification du type de fichier
    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      setError("Veuillez sélectionner uniquement des images.");
      return;
    }

    // Vérification de la taille
    const tooLargeFile = selectedFiles.find(
      (file) => file.size > 5 * 1024 * 1024,
    );

    if (tooLargeFile) {
      setError("Chaque image ne doit pas dépasser 5 Mo.");
      return;
    }

    // Maximum 10 photos
    const totalImages = images.length + selectedFiles.length;

    if (totalImages > 10) {
      setError("Vous pouvez ajouter maximum 10 photos.");
      return;
    }

    setError("");

    setImages((previousImages) => [...previousImages, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setImagePreviews((previousPreviews) => [
      ...previousPreviews,
      ...newPreviews,
    ]);

    // Permet de sélectionner à nouveau le même fichier
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((previousImages) =>
      previousImages.filter((_, imageIndex) => imageIndex !== index),
    );

    setImagePreviews((previousPreviews) =>
      previousPreviews.filter((_, previewIndex) => previewIndex !== index),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Vous devez être connecté pour créer une salle.");
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

      await createRoom(token, {
        name: name.trim(),
        capacity: Number(capacity),
        location: location.trim(),
        equipment: equipment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      });

      router.push("/dashboard/admin/salles");
    } catch (error) {
      console.error("Erreur création salle :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de créer la salle.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Ajouter une salle</h1>

          <p className="mt-2 text-sm text-gray-500">
            Renseignez les informations de la nouvelle salle.
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
              placeholder="Ex : Salle A"
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
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
              placeholder="Ex : 10"
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
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
              placeholder="Ex : 1er étage"
              className="w-full rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
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
              placeholder="Ex : Projecteur, Wi-Fi, écran..."
              rows={4}
              className="w-full resize-none rounded-md border border-[#E8E5DE] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]"
            />
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Photos de la salle
            </label>

            {/* Photos sélectionnées */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Photos sélectionnées
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={preview}
                      className="relative h-36 overflow-hidden rounded-md border border-[#E8E5DE] bg-[#FAF9F6] sm:h-40"
                    >
                      <Image
                        src={preview}
                        alt={`Photo sélectionnée ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 320px"
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-[#4F654F] px-2 py-1 text-xs font-semibold text-white transition hover:bg-[#5F765F]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
              photos.
            </p>
          </div>

          {/* Erreur */}
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
              {isSaving ? "Création..." : "Créer la salle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
