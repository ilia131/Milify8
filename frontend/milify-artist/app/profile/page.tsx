"use client";

import { useState } from "react";
import { usePanelUser } from "@milify/panel-kit/layout";
import { Editor, LiveData, type Row } from "@milify/panel-kit/resources";

export default function ProfilePage() {
  const { artist_name } = usePanelUser();
  const [saved, setSaved] = useState("");
  const artist = artist_name ? `artists2/${encodeURIComponent(artist_name)}` : null;
  return <>
    <h1>نمایهٔ هنرمند</h1>
    {saved && <p role="status">{saved}</p>}
    {artist && <LiveData<Row> endpoint={artist}>
      {(row, reload) => <Editor title="نمایهٔ عمومی" row={row} onDone={() => { setSaved("نمایه ذخیره شد."); reload(); }} mutation={{
        path: artist, method: "PATCH", multipart: true,
        fields: [["bio", "معرفی", "textarea"], ["profile_pic", "تصویر هنرمند", "file"], ["background", "پس‌زمینه", "file"]],
      }} />}
    </LiveData>}
    <LiveData<Row> endpoint="permissions/profile">
      {(row, reload) => <Editor title="اطلاعات حساب" row={row} onDone={() => { setSaved("اطلاعات حساب ذخیره شد."); reload(); }} mutation={{
        path: "permissions/profile", method: "PATCH", multipart: true,
        fields: [["username", "نام کاربری", undefined, true], ["first_name", "نام"], ["last_name", "نام خانوادگی"]],
      }} />}
    </LiveData>
  </>;
}
