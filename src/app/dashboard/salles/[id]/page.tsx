import Link from "next/link";
import RoomCarousel from "@/src/components/rooms/RoomCarousel";

interface RoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

type Room = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  images: {
    id: number;
    url: string;
  }[];
};

async function getRoom(id: string): Promise<Room> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`,
    {
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Impossible de récupérer la salle.");
  }

  return result;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;

  let room: Room;

  try {
    room = await getRoom(id);
  } catch (error) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/salles"
            className="text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
          >
            ← Retour aux salles
          </Link>

          <div className="mt-8 rounded-xl border border-[#E8E5DE] bg-white p-6">
            <p className="text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Impossible de récupérer la salle."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/salles"
          className="text-sm font-medium text-[#5F765F] transition hover:text-[#4F654F] hover:underline"
        >
          ← Retour aux salles
        </Link>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#E8E5DE] bg-white">
          {/* Photos */}
          <RoomCarousel roomName={room.name} images={room.images} />

          {/* Informations */}
          <div className="p-5 sm:p-8">
            <h1 className="text-2xl font-bold text-[#1F2A24]">{room.name}</h1>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="rounded-lg bg-[#FAF9F6] p-4">
                <p className="text-sm text-gray-500">Capacité</p>

                <p className="mt-1 font-semibold text-[#1F2A24]">
                  {room.capacity} personne
                  {room.capacity > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-lg bg-[#FAF9F6] p-4">
                <p className="text-sm text-gray-500">Localisation</p>

                <p className="mt-1 font-semibold text-[#1F2A24]">
                  {room.location}
                </p>
              </div>

              <div className="rounded-lg bg-[#FAF9F6] p-4 sm:col-span-2">
                <p className="text-sm text-gray-500">Équipements</p>

                <p className="mt-1 font-semibold text-[#1F2A24]">
                  {room.equipment || "Aucun équipement renseigné"}
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/reservation?roomId=${room.id}`}
              className="mt-8 flex w-full items-center justify-center rounded-md bg-[#5F765F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4F654F] sm:inline-flex sm:w-auto"
            >
              Réserver cette salle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
