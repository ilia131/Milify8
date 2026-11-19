
"use client";

import { Suspense } from "react";
import ActivateContent from "./ActivateContent";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              در حال بارگذاری…
            </h1>

            <p className="mt-2 text-gray-400">
              لطفاً منتظر بمانید.
            </p>
          </div>
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
