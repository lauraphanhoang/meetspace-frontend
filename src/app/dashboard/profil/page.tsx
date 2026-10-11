"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  changePassword,
  getProfile,
  updateAvatar,
  updateProfile,
} from "@/src/services/auth.service";

type User = {
  firstname: string;
  lastname: string;
  email: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/connexion");
        return;
      }

      try {
        const data = await getProfile(token);

        if (cancelled) return;

        setUser(data);
        setFirstname(data.firstname);
        setLastname(data.lastname);
        setEmail(data.email);
      } catch (error) {
        if (cancelled) return;

        console.error("Erreur récupération profil :", error);

        localStorage.removeItem("access_token");
        router.replace("/connexion");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Vous devez être connecté pour modifier votre photo.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploadingAvatar(true);

    try {
      const updatedUser = await updateAvatar(token, file);

      setUser(updatedUser);

      setSuccess("Votre photo de profil a été modifiée avec succès.");

      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Erreur modification photo :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier votre photo.",
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Vous devez être connecté pour modifier votre profil.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const updatedUser = await updateProfile(token, {
        firstname,
        lastname,
        email,
      });

      setUser(updatedUser);

      setFirstname(updatedUser.firstname);
      setLastname(updatedUser.lastname);
      setEmail(updatedUser.email);

      setSuccess("Votre profil a été modifié avec succès.");

      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Erreur modification profil :", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier votre profil.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setPasswordError("Vous devez être connecté.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }

    setPasswordError("");
    setPasswordSuccess("");
    setIsChangingPassword(true);

    try {
      await changePassword(token, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Votre mot de passe a été modifié avec succès.");
    } catch (error) {
      console.error("Erreur changement mot de passe :", error);

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier votre mot de passe.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputClassName =
    "mt-2 w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]";

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Mon profil</h1>

        <p className="mt-2 text-sm text-gray-500">
          Gérez vos informations personnelles et votre sécurité.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Chargement du profil...</p>
        ) : (
          <>
            {/* Photo de profil */}
            <div className="mt-6 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Photo de profil</h2>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8EEE6] text-xl font-semibold text-[#4F654F]">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.firstname} ${user.lastname}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      {user?.firstname?.charAt(0)}
                      {user?.lastname?.charAt(0)}
                    </>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">Votre photo</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Ajoutez une photo pour personnaliser votre profil.
                  </p>

                  <label
                    htmlFor="avatar"
                    className={`mt-3 inline-block cursor-pointer rounded-md border border-[#E8E5DE] px-4 py-2 text-sm font-medium text-[#4F654F] transition hover:bg-[#FAF9F6] ${
                      isUploadingAvatar ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {isUploadingAvatar
                      ? "Envoi en cours..."
                      : "Ajouter une photo"}

                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
              </div>

              {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

              {success && (
                <p className="mt-5 text-sm text-[#5F765F]">{success}</p>
              )}
            </div>

            {/* Informations personnelles */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold">
                Informations personnelles
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-semibold"
                  >
                    Prénom
                  </label>

                  <input
                    id="firstname"
                    type="text"
                    value={firstname}
                    onChange={(event) => setFirstname(event.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-semibold"
                  >
                    Nom
                  </label>

                  <input
                    id="lastname"
                    type="text"
                    value={lastname}
                    onChange={(event) => setLastname(event.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>
              </div>

              {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

              {success && (
                <p className="mt-5 text-sm text-[#5F765F]">{success}</p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="mt-6 w-full rounded-md bg-[#5F765F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSaving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </form>

            {/* Mot de passe */}
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-6 rounded-xl border border-[#E8E5DE] bg-white p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold">Sécurité</h2>

              <p className="mt-2 text-sm text-gray-500">
                Modifiez votre mot de passe pour sécuriser votre compte.
              </p>

              <div className="mt-6 space-y-5">
                {/* Mot de passe actuel */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-semibold"
                  >
                    Mot de passe actuel
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      className={`${inputClassName} pr-12`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#5F765F]"
                      aria-label={
                        showCurrentPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold"
                  >
                    Nouveau mot de passe
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className={`${inputClassName} pr-12`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#5F765F]"
                      aria-label={
                        showNewPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold"
                  >
                    Confirmer le nouveau mot de passe
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className={`${inputClassName} pr-12`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#5F765F]"
                      aria-label={
                        showConfirmPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p className="mt-5 text-sm text-red-600">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="mt-5 text-sm text-[#5F765F]">{passwordSuccess}</p>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="mt-6 w-full rounded-md bg-[#5F765F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isChangingPassword
                  ? "Modification..."
                  : "Modifier le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
