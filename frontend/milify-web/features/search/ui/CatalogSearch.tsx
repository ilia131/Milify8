"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, X, Play, Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setQueue } from "@/redux/features/playerSlice";
import { useGetSearchQuery, useSearchAlbumsQuery } from "@/redux/services/searchFilterApislice";
import { useGetUserPlaylistsQuery } from "@/redux/services/playlistApiSlice";

function ResultLink({ href, title, subtitle, image }: {
  href: string; title: string; subtitle: string; image?: string;
}) {
  return (
    <Link href={href} className="catalog-result min-w-0">
      {image ? <Image src={image} alt="" width={48} height={48} className="catalog-thumb" /> :
        <Music2 aria-hidden className="catalog-thumb p-3" />}
      <span className="min-w-0">
        <span className="block truncate font-semibold" dir="auto">{title}</span>
        <span className="block truncate text-sm text-[var(--milify-muted)]" dir="auto">{subtitle}</span>
      </span>
    </Link>
  );
}

function ResultSection({ title, loading, failed, retry, children }: {
  title: string; loading: boolean; failed: boolean; retry: () => void; children: ReactNode[];
}) {
  return (
    <section className="min-w-0 space-y-2" aria-busy={loading}>
      <h2 className="text-xl font-bold">{title}</h2>
      {loading ? <div role="status" aria-label="در حال جست‌وجو" className="space-y-2">
        {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
      </div> : failed ? <p role="alert" className="text-sm">
        دریافت نتایج ممکن نشد. <button type="button" className="underline" onClick={retry}>تلاش دوباره</button>
      </p> : children.length ? children : <p className="text-sm text-[var(--milify-muted)]">نتیجه‌ای پیدا نشد.</p>}
    </section>
  );
}

export default function CatalogSearch({ initialQuery, children }: { initialQuery: string; children: ReactNode }) {
  const [input, setInput] = useState(initialQuery);
  const [filter, setFilter] = useState("all");
  const query = input.trim();
  const [debounced] = useDebounce(query, 250);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const search = useGetSearchQuery(debounced, { skip: !debounced });
  const albums = useSearchAlbumsQuery(debounced, { skip: !debounced });
  const playlists = useGetUserPlaylistsQuery(0, { skip: !authenticated || !query });
  const songs = search.currentData?.songs.results ?? [];
  const artists = search.currentData?.artists.results ?? [];
  const top = search.currentData?.top_result;
  const waiting = query !== debounced;
  const filters = [
    ["all", "همه"], ["song", "آهنگ‌ها"], ["artist", "هنرمندان"], ["album", "آلبوم‌ها"],
    ...(authenticated ? [["playlist", "پلی‌لیست‌های من"]] : []),
  ];

  return (
    <main className="milify-page">
      <h1 className="mb-4 text-3xl font-black">جست‌وجو</h1>
      <form role="search" className="milify-search max-w-xl" onSubmit={(event) => event.preventDefault()}>
        <Search size={21} aria-hidden />
        <input type="search" value={input} onChange={(event) => setInput(event.target.value)} maxLength={200}
          aria-label="نام آهنگ، هنرمند، آلبوم یا پلی‌لیست" placeholder="چه چیزی می‌خواهید بشنوید؟" dir="auto" />
        {input && <button type="button" className="milify-icon" aria-label="پاک کردن جست‌وجو" onClick={() => {
          setInput("");
          if (initialQuery) router.replace("/search", { scroll: false });
        }}><X size={18} /></button>}
      </form>
      {!query ? children : <>
        <div aria-label="نوع نتیجه" className="my-5 flex flex-wrap gap-2">
          {filters.map(([id, title]) => <button key={id} type="button" className="milify-chip"
            aria-pressed={filter === id} onClick={() => setFilter(id)}>{title}</button>)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {filter === "all" && top && !waiting && !search.isError && <div className="xl:col-span-2">
            <h2 className="mb-2 text-xl font-bold">برترین نتیجه</h2>
            {top.type === "song"
              ? <ResultLink href={`/track/${encodeURIComponent(top.unique_id)}`} title={top.title} subtitle="آهنگ" image={top.image_url} />
              : <ResultLink href={`/artist/${encodeURIComponent(top.artistname)}`} title={top.artistname} subtitle="هنرمند" image={top.profile_pic} />}
          </div>}
          {(filter === "all" || filter === "song") && <ResultSection title="آهنگ‌ها" loading={waiting || search.isFetching}
            failed={search.isError} retry={search.refetch}>
            {songs.map((song, index) => <div key={song.id} className="flex items-center gap-2">
              <div className="min-w-0 flex-1"><ResultLink href={`/track/${encodeURIComponent(song.unique_id)}`}
                title={song.title} subtitle={song.artistname || song.artists?.join("، ") || "آهنگ"} image={song.image_url} /></div>
              <button type="button" className="milify-play" aria-label={`پخش ${song.title}`}
                onClick={() => dispatch(setQueue({ songs, startIndex: index }))}><Play size={16} fill="currentColor" /></button>
            </div>)}
          </ResultSection>}
          {(filter === "all" || filter === "artist") && <ResultSection title="هنرمندان" loading={waiting || search.isFetching}
            failed={search.isError} retry={search.refetch}>
            {artists.map((artist) => <ResultLink key={artist.id} href={`/artist/${encodeURIComponent(artist.artistname)}`}
              title={artist.artistname} subtitle="هنرمند" image={artist.profile_pic} />)}
          </ResultSection>}
          {(filter === "all" || filter === "album") && <ResultSection title="آلبوم‌ها" loading={waiting || albums.isFetching}
            failed={albums.isError} retry={albums.refetch}>
            {(albums.currentData ?? []).flatMap((album) => {
              const artist = album.artist?.[0]?.name;
              return artist ? [<ResultLink key={album.id} href={`/album/${encodeURIComponent(artist)}/${encodeURIComponent(album.title)}`}
                title={album.title} subtitle={artist} image={album.cover} />] : [];
            })}
          </ResultSection>}
          {authenticated && (filter === "all" || filter === "playlist") && <ResultSection title="پلی‌لیست‌های من"
            loading={playlists.isFetching} failed={playlists.isError} retry={playlists.refetch}>
            {(playlists.currentData ?? []).filter(({ name }) => name.toLocaleLowerCase("fa").includes(query.toLocaleLowerCase("fa")))
              .map((playlist) => <ResultLink key={playlist.id} href={`/library/playlist/${encodeURIComponent(playlist.unique_id)}`}
                title={playlist.name} subtitle="پلی‌لیست" image={playlist.tracks?.[0]?.song?.image_url} />)}
          </ResultSection>}
        </div>
      </>}
    </main>
  );
}
