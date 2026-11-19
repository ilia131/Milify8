"use client";

import { LiveData } from "@milify/panel-kit/resources";

type Totals = {
  gross_subscription_sales: string;
  successful_payments: number;
  upload_capacity: Record<"songs" | "videos", { used: number; limit: number | null; remaining: number | null }>;
};
const number = new Intl.NumberFormat("fa-IR");

export default function RevenuePage() {
  return <>
    <h1>درآمد و ظرفیت آپلود</h1>
    <LiveData<Totals> endpoint="panel-data/artist/commercial">
      {(data) => <>
        <section className="panel-card">
          <h2>فروش ناخالص اشتراک هنرمند</h2>
          <p>{number.format(Number(data.gross_subscription_sales))} تومان</p>
          <p>{number.format(data.successful_payments)} پرداخت موفق</p>
        </section>
        <div className="panel-grid">{([["songs", "آهنگ"], ["videos", "ویدیو"]] as const).map(([key, label]) => {
          const capacity = data.upload_capacity[key];
          return <section key={key} className="panel-card">
            <h2>ظرفیت {label}</h2>
            <p>{number.format(capacity.used)} مورد ثبت‌شده</p>
            <p>{capacity.remaining == null ? "سقف آپلود تنظیم نشده است." : `${number.format(capacity.remaining)} مورد باقی مانده است.`}</p>
          </section>;
        })}</div>
      </>}
    </LiveData>
  </>;
}
