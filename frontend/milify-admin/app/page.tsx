"use client";

import { LiveData } from "@milify/panel-kit/resources";

const metrics = [["total_revenue", "کل درآمد"], ["today_revenue", "درآمد امروز"],
  ["monthly_revenue", "درآمد ماه"], ["active_subscriptions", "اشتراک فعال"],
  ["successful_payments", "پرداخت موفق"], ["failed_payments", "پرداخت ناموفق"]] as const;

export default function Dashboard() {
  return <>
    <h1>داشبورد مدیریت</h1>
    <LiveData<Record<string, string | number>> endpoint="subscriptions/access/revenue">
      {(data) => <div className="panel-grid">{metrics.map(([key, title]) =>
        <div key={key} className="panel-card"><dl><dt>{title}</dt><dd>{Number(data[key]).toLocaleString("fa-IR")}</dd></dl></div>)}</div>}
    </LiveData>
  </>;
}
