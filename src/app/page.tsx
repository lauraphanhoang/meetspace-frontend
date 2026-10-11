import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
          <Image
            src="/logo-meetspace.png"
            alt="Logo MeetSpace"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 128px, 160px"
          />
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-[#1F2A24]">
            Bienvenue sur MeetSpace
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F756F] sm:text-base">
            Réservez facilement une salle adaptée à vos besoins et gérez toutes
            vos réservations depuis votre espace.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/connexion"
            className="flex w-full items-center justify-center rounded-md bg-[#5F765F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F]"
          >
            Se connecter
          </Link>

          <Link
            href="/inscription"
            className="flex w-full items-center justify-center rounded-md border border-[#E8E5DE] bg-white px-5 py-3 text-sm font-semibold text-[#4F654F] transition hover:bg-[#FAF9F6]"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
