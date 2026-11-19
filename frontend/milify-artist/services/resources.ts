import type { Field, Resource } from "@milify/panel-kit/resources";

const base = "panel-data/artist";
const songFields: readonly Field[] = [
  ["title", "عنوان آهنگ", undefined, true], ["description", "توضیحات", "textarea"],
  ["image", "کاور", "file"], ["album", "شناسهٔ آلبوم", "number"], ["is_published", "منتشرشده", "boolean"],
];
const albumFields: readonly Field[] = [
  ["title", "عنوان", undefined, true], ["description", "توضیحات", "textarea"],
  ["cover", "کاور", "file"], ["release_date", "تاریخ انتشار", "date"], ["is_published", "منتشرشده", "boolean"],
];

export const resources: Record<string, Resource> = {
  songs: {
    title: "آهنگ‌های من", endpoint: `${base}/songs`,
    columns: [["title", "عنوان"], ["play_count", "تعداد پخش"], ["verified", "تأیید"], ["is_published", "انتشار"]],
    create: { path: `${base}/songs`, multipart: true, fields: [...songFields, ["track", "فایل صوتی", "file", true]] },
    edit: { path: (id) => `${base}/songs/${id}`, method: "PATCH", multipart: true, fields: songFields },
  },
  albums: {
    title: "آلبوم‌های من", endpoint: `${base}/albums`,
    columns: [["id", "شناسهٔ آلبوم"], ["title", "عنوان"], ["release_date", "تاریخ"], ["is_published", "انتشار"]],
    create: { path: `${base}/albums`, multipart: true, fields: albumFields },
    edit: { path: (id) => `${base}/albums/${id}`, method: "PATCH", multipart: true, fields: albumFields },
  },
  videos: {
    title: "ویدیوهای کوتاه من", endpoint: `${base}/shorts`,
    columns: [["caption", "عنوان"], ["views", "بازدید"], ["allow_comments", "دیدگاه‌ها"], ["is_official", "رسمی"]],
    create: { path: `${base}/shorts`, multipart: true, fields: [["caption", "عنوان", "textarea"],
      ["video", "فایل ویدیو", "file", true], ["thumbnail", "تصویر پیش‌نمایش", "file"],
      ["allow_comments", "اجازهٔ دیدگاه", "boolean"]] },
    edit: { path: (id) => `${base}/shorts/${id}`, method: "PATCH", multipart: true, fields: [
      ["caption", "عنوان", "textarea"], ["thumbnail", "تصویر پیش‌نمایش", "file"], ["allow_comments", "اجازهٔ دیدگاه", "boolean"],
    ] },
    actions: [{ label: "حذف", path: (id) => `${base}/shorts/${id}`, method: "DELETE", confirm: "این ویدیو حذف شود؟" }],
  },
};
