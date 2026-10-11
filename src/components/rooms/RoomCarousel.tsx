"use client";

import { useState } from "react";
import Image from "next/image";

type RoomImage = {
  id: number;
  url: string;
};

type RoomCarouselProps = {
  roomName: string;
  images: RoomImage[];
};

export default function RoomCarousel({ roomName, images }: RoomCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center bg-[#FAF9F6] text-sm text-gray-400 sm:h-72 lg:h-96">
        Aucune image
      </div>
    );
  }

  const previousImage = () => {
    setCurrentImage((currentImage - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setCurrentImage((currentImage + 1) % images.length);
  };

  return (
    <div className="relative bg-[#FAF9F6]">
      <div className="relative h-56 sm:h-72 lg:h-96">
        <Image
          src={images[currentImage].url}
          alt={`${roomName} - photo ${currentImage + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          {/* Photo précédente */}
          <button
            type="button"
            onClick={previousImage}
            aria-label="Photo précédente"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#4F654F] shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F765F] sm:left-4 sm:h-10 sm:w-10 sm:text-xl"
          >
            ←
          </button>

          {/* Photo suivante */}
          <button
            type="button"
            onClick={nextImage}
            aria-label="Photo suivante"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#4F654F] shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F765F] sm:right-4 sm:h-10 sm:w-10 sm:text-xl"
          >
            →
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-3 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/50 px-3 py-2 sm:bottom-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentImage(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                aria-current={index === currentImage}
                className={`h-2 w-2 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white ${
                  index === currentImage
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
