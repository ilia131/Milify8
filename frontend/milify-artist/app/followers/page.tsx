"use client";

import { usePanelUser } from "@milify/panel-kit/layout";
import { ResourcePage } from "@milify/panel-kit/resources";

export default function Followers() {
  const { artist_name } = usePanelUser();
  if (!artist_name) return <h1>دنبال‌کنندگان</h1>;
  return <ResourcePage resource={{
    title: "دنبال‌کنندگان به تفکیک روز",
    endpoint: `dashboard/${encodeURIComponent(artist_name)}/followers-chart`,
    columns: [["date", "تاریخ"], ["followers", "تعداد"]],
    id: "date",
  }} />;
}
