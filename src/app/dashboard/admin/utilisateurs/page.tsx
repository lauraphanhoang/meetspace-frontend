"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users } from "lucide-react";

import { getUsers } from "@/src/services/reservations.service";
import AdminGuard from "@/src/components/auth/AdminGuard";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté pour accéder à cette page.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUsers(token);

        setUsers(data);
      } catch (error) {
        console.error("Erreur chargement utilisateurs :", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les utilisateurs.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-sm text-gray-500">
            Chargement des utilisateurs...
          </p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* En-tête */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8EEE6]">
                <Users size={21} className="text-[#5F765F]" />
              </div>

              <h1 className="text-2xl font-bold">Utilisateurs</h1>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Consultez les utilisateurs inscrits sur MeetSpace.
            </p>
          </div>

          {/* Erreur */}
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          {/* Liste */}
          <div className="mt-8 overflow-hidden rounded-lg border border-[#E8E5DE] bg-white">
            {users.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Aucun utilisateur enregistré.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-[#E8E5DE] bg-[#FAF9F6]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Utilisateur</th>

                      <th className="px-6 py-4 font-semibold">Email</th>

                      <th className="px-6 py-4 font-semibold">Rôle</th>

                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#FAF9F6]"
                      >
                        {/* Utilisateur */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8EEE6] text-sm font-medium text-[#4F654F]">
                              {user.avatarUrl ? (
                                <Image
                                  src={user.avatarUrl}
                                  alt={`${user.firstname} ${user.lastname}`}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <>
                                  {user.firstname.charAt(0)}
                                  {user.lastname.charAt(0)}
                                </>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">
                                {user.firstname} {user.lastname}
                              </p>

                              <p className="text-xs text-gray-500">
                                ID #{user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-gray-700">
                          {user.email}
                        </td>

                        {/* Rôle */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-[#E8EEE6] text-[#4F654F]"
                                : "bg-[#FAF9F6] text-[#6F756F]"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/admin/utilisateurs/${user.id}`}
                            className="inline-flex items-center gap-2 font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
                          >
                            Voir
                            <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
