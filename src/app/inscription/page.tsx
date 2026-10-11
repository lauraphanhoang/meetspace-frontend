"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { registerUser } from "@/src/services/auth.service";

import { Eye, EyeOff } from "lucide-react";

export default function InscriptionPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await registerUser({
        firstname,
        lastname,
        email,
        password,
      });

      setSuccess("Votre compte a été créé avec succès.");

      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]";

  return (
    <AuthLayout>
      <div className="rounded-xl border border-[#E8E5DE] bg-white p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold text-[#1F2A24]">
          Créer un compte
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="lastname"
              className="mb-2 block text-sm font-semibold text-[#1F2A24]"
            >
              Nom
            </label>

            <input
              id="lastname"
              type="text"
              placeholder="Entrez votre nom"
              value={lastname}
              onChange={(event) => setLastname(event.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="firstname"
              className="mb-2 block text-sm font-semibold text-[#1F2A24]"
            >
              Prénom
            </label>

            <input
              id="firstname"
              type="text"
              placeholder="Entrez votre prénom"
              value={firstname}
              onChange={(event) => setFirstname(event.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#1F2A24]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#1F2A24]"
            >
              Mot de passe
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClassName} pr-12`}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6F756F] transition hover:text-[#5F765F]"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
            disabled={isLoading}
            className="w-full rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Création du compte..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#1F2A24]">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
