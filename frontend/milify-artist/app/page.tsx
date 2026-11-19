"use client";

import { usePanelUser } from "@milify/panel-kit/layout";
import { LiveData } from "@milify/panel-kit/resources";

type Dashboard = {
  monthly_listeners: number;
  followers: number;
  total_streams: number;
  watch_time_hours: number;
  top_songs: { id: number; title: string; play_count: number }[];
};
const metrics = [
  ["monthly_listeners", "شنوندگان ماهانه"], ["followers", "دنبال‌کنندگان"],
  ["total_streams", "تعداد پخش"], ["watch_time_hours", "ساعت شنیدن"],
] as const;

export default function DashboardPage() {
  const { artist_name } = usePanelUser();
  return <>
    <h1>داشبورد هنرمند</h1>
    {artist_name && <LiveData<Dashboard> endpoint={`dashboard/${encodeURIComponent(artist_name)}`}>
      {(data) => <>
        <div className="panel-grid">{metrics.map(([key, label]) =>
          <div key={key} className="panel-card"><dl><dt>{label}</dt><dd>{data[key].toLocaleString("fa-IR")}</dd></dl></div>)}</div>
        <section className="panel-card">
          <h2>آهنگ‌های پرپخش</h2>
          {data.top_songs.length ? <ul>{data.top_songs.map((song) => <li key={song.id}>{song.title} · {song.play_count.toLocaleString("fa-IR")} پخش</li>)}</ul> :
            <p>آهنگی ثبت نشده است.</p>}
        </section>
      </>}
    </LiveData>}
  </>;
}
