"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/src/services/auth.service";

type User = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
};

interface UserGuardProps {
  children: ReactNode;
}

export default function UserGuard({ children }: UserGuardProps) {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/connexion");
        return;
      }

      try {
        const user: User = await getProfile(token);

        if (cancelled) {
          return;
        }

        if (user.role === "ADMIN") {
          router.replace("/dashboard/admin");
          return;
        }

        setIsUser(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Erreur vérification utilisateur :", error);

        localStorage.removeItem("access_token");
        router.replace("/connexion");
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="px-4 py-8 text-sm text-[#6F756F]">
        Vérification des autorisations...
      </div>
    );
  }

  if (!isUser) {
    return null;
  }

  return <>{children}</>;
}
