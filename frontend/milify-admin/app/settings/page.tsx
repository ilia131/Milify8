"use client";

import { useState } from "react";
import { Editor } from "@milify/panel-kit/resources";

export default function Settings() {
  const [done, setDone] = useState(false);
  return <>
    <h1>تنظیمات حساب مدیریت</h1>
    {done ? <p role="status">رمز عبور تغییر کرد. برای ادامه دوباره وارد شوید.</p> :
      <Editor title="تغییر رمز عبور" onDone={() => setDone(true)} mutation={{
        path: "permissions/change-password",
        fields: [["current_password", "رمز فعلی", "password", true], ["new_password", "رمز جدید", "password", true],
          ["confirm_password", "تکرار رمز جدید", "password", true]],
      }} />}
  </>;
}
