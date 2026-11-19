"use client";

import CardSection from "@/shared/CardSection/CardSection";
import { useAppSelector } from "@/redux/hook";
import { useGetForYouQuery, useGetRecentlyPlayedQuery } from "@/redux/services/songApiSlice";

export default function ListeningSections() {
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const history = useGetRecentlyPlayedQuery(undefined, { skip: !authenticated });
  const recommendations = useGetForYouQuery(undefined, { skip: !authenticated });

  if (!authenticated) return null;

  const sections = [
    { title: "آخرین پخش‌ها", songs: history.data?.map(({ song }) => song), query: history },
    { title: "پیشنهاد برای شما", songs: recommendations.data, query: recommendations },
  ];

  return (
    <div className="px-4 pt-24 lg:px-0 lg:pt-5">
      {sections.map(({ title, songs, query }) => songs?.length ? (
        <CardSection key={title} title={title} variant="track" items={songs} />
      ) : (
        <section key={title} className="mb-4 rounded-2xl border border-white/10 p-4">
          <h2 className="font-semibold">{title}</h2>
          <div className="mt-2 text-sm text-white/65" role="status">
            {query.isLoading ? "در حال بارگذاری…" :
              query.isError ? <button type="button" onClick={() => query.refetch()}>بارگذاری انجام نشد. تلاش دوباره</button> :
              "هنوز آهنگی برای نمایش وجود ندارد."}
          </div>
        </section>
      ))}
    </div>
  );
}
