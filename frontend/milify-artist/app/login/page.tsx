"use client";

import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { PanelLogin } from "@milify/panel-kit/layout";
import { session } from "@milify/panel-kit/client";

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  return <div>
    <PanelLogin title="ورود به پنل هنرمندان میلیفای" />
    {clientId && <div className="panel-card" aria-busy={pending}>
      <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => setNotice("سرویس گوگل در دسترس نیست.")}>
        <GoogleLogin onError={() => setNotice("ورود گوگل انجام نشد.")} onSuccess={async ({ credential }) => {
          if (!credential || pending) return;
          setPending(true);
          setNotice("در حال بررسی…");
          try {
            await session("google", { id_token: credential });
            window.location.replace("/");
          } catch (failure) {
            setNotice(failure instanceof Error ? failure.message : "ورود گوگل انجام نشد.");
            setPending(false);
          }
        }} />
      </GoogleOAuthProvider>
      {notice && <p role="status">{notice}</p>}
    </div>}
  </div>;
}
