"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { getProfile, logoutUser } from "@/src/services/auth.service";

type User = {
  firstname: string;
  lastname: string;
  email: string;
  avatarUrl?: string | null;
};

type DashboardHeaderProps = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

export default function DashboardHeader({
  onMenuClick,
  isMenuOpen,
}: DashboardHeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        const data = await getProfile(token);
        setUser(data);
      } catch (error) {
        console.error("Erreur récupération profil :", error);
      }
    };

    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/connexion";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E8E5DE] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          className="shrink-0 rounded-md p-2 text-[#4F654F] transition hover:bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-[#5F765F] md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link
          href="/dashboard"
          aria-label="MeetSpace - Tableau de bord"
          className="relative h-14 w-52 shrink-0"
        >
          <Image
            src="/logo-meetspace-text.png"
            alt="MeetSpace"
            fill
            sizes="240px"
            className="object-contain object-left"
            priority
          />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <Link
          href="/dashboard/profil"
          className="hidden max-w-48 truncate text-sm font-semibold text-[#1F2A24] transition hover:text-[#5F765F] hover:underline sm:block"
        >
          {user ? `${user.firstname} ${user.lastname}` : "Chargement..."}
        </Link>

        <Link
          href="/dashboard/profil"
          aria-label="Mon profil"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8EEE6] text-[#4F654F] transition hover:bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-[#5F765F]"
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={`${user.firstname} ${user.lastname}`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              loading="eager"
            />
          ) : (
            <UserCircle size={28} strokeWidth={1.8} />
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Se déconnecter"
          className="rounded-md p-2 text-[#6F756F] transition hover:bg-[#FAF9F6] hover:text-[#4F654F] focus:outline-none focus:ring-2 focus:ring-[#5F765F]"
        >
          <LogOut size={22} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
