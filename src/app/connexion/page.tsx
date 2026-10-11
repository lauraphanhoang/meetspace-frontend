"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { loginUser, getProfile } from "@/src/services/auth.service";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
      });

      localStorage.setItem("access_token", result.access_token);

      const profile = await getProfile(result.access_token);

      if (profile.role === "ADMIN") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la connexion.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border border-[#E8E5DE] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5F765F] focus:ring-1 focus:ring-[#5F765F]";

  return (
    <AuthLayout>
      <div className="rounded-xl border border-[#E8E5DE] bg-white p-6 text-[#1F2A24] sm:p-8">
        <h2 className="text-center text-2xl font-bold">Se connecter</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">
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
              className="mb-2 block text-sm font-semibold"
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
                onClick={() => setShowPassword(!showPassword)}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[#5F765F] py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
