import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Présentation */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-36 h-36 md:w-56 md:h-56 mb-8 md:mb-12">
              <Image
                src="/logo-meetspace.png"
                alt="Logo MeetSpace"
                fill
                sizes="(max-width: 768px) 144px, 224px"
                className="object-contain"
                priority
              />
            </div>

            <p className="text-gray-600">Plateforme de réservation de salles</p>
          </div>

          {/* Formulaire */}
          <div>{children}</div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-gray-500">
        ©2026 MeetSpace, tous droits réservés
      </footer>
    </div>
  );
}
