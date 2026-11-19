"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppSelector } from "@/redux/hook";
import {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  usePurchaseSubscriptionMutation,
} from "@/redux/services/subscriptionApiSlice";

const number = new Intl.NumberFormat("fa-IR");
const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" });

export default function SubscriptionPage() {
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const plans = useGetSubscriptionPlansQuery();
  const current = useGetMySubscriptionQuery(undefined, { skip: !authenticated });
  const [buyPlan, { isLoading }] = usePurchaseSubscriptionMutation();
  const [message, setMessage] = useState("");
  const subscription = current.data?.subscription;

  async function purchase(planId: string) {
    setMessage("");
    try {
      await buyPlan({ plan_id: planId }).unwrap();
      setMessage("اشتراک شما فعال شد.");
    } catch (error) {
      const status = (error as { status?: number }).status;
      setMessage(status === 400 ? "خرید انجام نشد. موجودی کیف پول و وضعیت اشتراک را بررسی کنید."
        : "خرید انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 pb-36 pt-24 lg:pt-8">
      <h1 className="mb-5 text-2xl font-bold">اشتراک میلیفای</h1>
      {plans.isLoading || current.isLoading ? <p role="status">در حال بارگذاری اشتراک‌ها…</p> : null}
      {plans.isError || current.isError ? (
        <button type="button" className="text-emerald-300" onClick={() => {
          if (plans.isError) plans.refetch();
          if (current.isError) current.refetch();
        }}>بارگذاری انجام نشد. تلاش دوباره</button>
      ) : null}

      {subscription ? (
        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-5">
          <h2 className="text-lg font-semibold">{subscription.plan.name}</h2>
          <p className="mt-1 text-emerald-300">اشتراک فعال</p>
          <p className="mt-3 text-sm text-white/70">پایان اشتراک {date.format(new Date(subscription.expires_at))}</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.data?.map((plan) => (
            <article key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.description && <p className="mt-2 text-sm text-white/70">{plan.description}</p>}
              <p className="my-4">{number.format(Number(plan.price))} تومان · {number.format(plan.duration_days)} روز</p>
              {authenticated ? (
                <button type="button" disabled={isLoading || current.isFetching || current.isError}
                  onClick={() => purchase(plan.id)}
                  className="w-full rounded-xl bg-emerald-300 py-2.5 text-black disabled:opacity-50">
                  {isLoading ? "در حال ثبت خرید…" : "خرید اشتراک"}
                </button>
              ) : <Link className="text-emerald-300" href="/auth/login">ورود برای خرید اشتراک</Link>}
            </article>
          ))}
          {plans.data?.length === 0 && <p>در حال حاضر طرحی برای خرید وجود ندارد.</p>}
        </div>
      )}
      <p className="mt-4 text-sm" role="status">{message}</p>
    </main>
  );
}
