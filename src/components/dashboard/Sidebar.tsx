"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, DoorOpen, Home, Plus, User, Users } from "lucide-react";
import { getProfile } from "@/src/services/auth.service";

type MenuItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        const profile = await getProfile(token);
        setIsAdmin(profile.role === "ADMIN");
      } catch (error) {
        console.error("Erreur récupération profil :", error);
      }
    };

    loadProfile();
  }, []);

  // Ferme le menu mobile après un changement de page
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  const menuItems: MenuItem[] = [
    {
      label: "Tableau de bord",
      href: isAdmin ? "/dashboard/admin" : "/dashboard",
      icon: Home,
    },
    {
      label: "Salles",
      href: isAdmin ? "/dashboard/admin/salles" : "/dashboard/salles",
      icon: DoorOpen,
    },
    {
      label: isAdmin ? "Toutes les réservations" : "Mes réservations",
      href: isAdmin
        ? "/dashboard/admin/reservations"
        : "/dashboard/reservations",
      icon: CalendarDays,
    },
    ...(isAdmin
      ? [
          {
            label: "Utilisateurs",
            href: "/dashboard/admin/utilisateurs",
            icon: Users,
          },
        ]
      : []),
    ...(!isAdmin
      ? [
          {
            label: "Nouvelle réservation",
            href: "/dashboard/reservation",
            icon: Plus,
          },
        ]
      : []),
    {
      label: "Mon profil",
      href: "/dashboard/profil",
      icon: User,
    },
  ];

  return (
    <aside
      className={`
        shrink-0 bg-white
        ${
          isOpen
            ? "fixed left-0 top-16 z-50 w-[calc(100%-40px)] border-r border-[#E8E5DE] shadow-lg"
            : "hidden"
        }
        md:static md:block md:w-60 md:border-r md:border-[#E8E5DE] md:shadow-none
      `}
    >
      <nav className="py-4 md:py-6" aria-label="Navigation principale">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/dashboard/admin" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-4 rounded-md px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#5F765F] ${
                  isActive
                    ? "bg-[#E8EEE6] text-[#4F654F]"
                    : "text-[#1F2A24] hover:bg-[#FAF9F6] hover:text-[#4F654F]"
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 2}
                  className="shrink-0"
                />

                <span className="leading-5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
