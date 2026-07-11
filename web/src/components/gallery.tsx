import Image from "next/image";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  if (photos.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((src) => (
        <div key={src} className="relative aspect-video overflow-hidden rounded-lg border border-border">
          <Image src={src} alt={alt} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
