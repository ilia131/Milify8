import Image from "next/image";
import Link from "next/link";

export default function AlbumHero({ image, title, artist }: { image: string; title: string; artist: string }) {
  return <header className="milify-welcome !mx-0 flex-col items-start sm:flex-row sm:justify-start">
    <Image src={image} alt="" width={176} height={176} className="aspect-square w-36 rounded-xl object-cover sm:w-44" />
    <div className="min-w-0">
      <p className="mb-1 text-sm text-[var(--milify-muted)]">آلبوم</p>
      <h1 className="mb-2 break-words text-3xl font-black sm:text-5xl" dir="auto">{title}</h1>
      <Link href={`/artist/${encodeURIComponent(artist)}`} className="break-words text-[var(--milify-muted)] hover:underline" dir="auto">{artist}</Link>
    </div>
  </header>;
}
