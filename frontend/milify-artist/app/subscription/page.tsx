"use client";

import { useState } from "react";
import { api } from "@milify/panel-kit/client";
import { Editor, LiveData, type Row } from "@milify/panel-kit/resources";

type Plan = { id: string; name: string; price: string; duration_days: number };
type Subscription = { subscription: { plan: Plan; expires_at: string } | null };

export default function SubscriptionPage() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function purchase(planId: string, reload: () => void) {
    setPending(true);
    setMessage("");
    try {
      await api("subscriptions/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan_id: planId }) });
      setMessage("اشتراک فعال شد.");
      reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تمدید انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return <>
    <h1>اشتراک و طرح فروش</h1>
    {message && <p role="status">{message}</p>}
    <LiveData<{ plan: Row | null }> endpoint="panel-data/artist/plan">
      {({ plan }, reload) => <Editor title="طرح اشتراک برای شنوندگان" row={plan ?? undefined}
        onDone={() => { setMessage("طرح ذخیره شد."); reload(); }}
        mutation={{ path: "panel-data/artist/plan", method: "PUT", fields: [
          ["name", "نام طرح", undefined, true], ["description", "توضیحات", "textarea"],
          ["price", "قیمت به تومان", "number", true], ["duration_days", "مدت به روز", "number", true],
          ["is_active", "فعال", "boolean"],
        ] }} />}
    </LiveData>
    <section className="panel-card">
      <h2>اشتراک حساب من</h2>
      <LiveData<Subscription> endpoint="subscriptions/me">
        {({ subscription }, reload) => subscription ?
          <p>{subscription.plan.name} · فعال تا {new Date(subscription.expires_at).toLocaleDateString("fa-IR")}</p> :
          <LiveData<Plan[]> endpoint="subscriptions/plans">
            {(plans) => plans.length ? <div className="panel-grid">{plans.map((plan) =>
              <div className="panel-card" key={plan.id}><h2>{plan.name}</h2>
                <p>{Number(plan.price).toLocaleString("fa-IR")} تومان · {plan.duration_days.toLocaleString("fa-IR")} روز</p>
                <button disabled={pending} onClick={() => purchase(plan.id, reload)}>فعال‌سازی یا تمدید</button>
              </div>)}</div> : <p>طرح فعالی برای تمدید موجود نیست.</p>}
          </LiveData>}
      </LiveData>
    </section>
  </>;
}
