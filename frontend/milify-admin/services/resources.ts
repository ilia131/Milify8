import type { Field, Resource } from "@milify/panel-kit/resources";

const account = "permissions/admin/users";
const artists = "admin/artists";
const songs = "access/songs";
const ads = "ads/access/ads";
const adminData = "panel-data/admin";
const plan = "panel-data/admin/plans";
const identity: readonly Field[] = [
  ["email", "ایمیل", "email", true], ["username", "نام کاربری", undefined, true],
  ["first_name", "نام"], ["last_name", "نام خانوادگی"], ["is_active", "فعال", "boolean"],
];
const artistFields: readonly Field[] = [
  ["artistname", "نام هنری", undefined, true], ["bio", "معرفی", "textarea"],
  ["profile_pic", "تصویر نمایه", "file"], ["background", "تصویر پس‌زمینه", "file"],
];
const songFields: readonly Field[] = [
  ["title", "عنوان", undefined, true], ["description", "توضیحات", "textarea"],
  ["track", "فایل صوتی", "file"], ["image", "کاور", "file"], ["is_published", "منتشرشده", "boolean"],
];
const albumFields: readonly Field[] = [
  ["title", "عنوان", undefined, true], ["artist", "شناسهٔ هنرمند", "number", true],
  ["description", "توضیحات", "textarea"], ["cover", "کاور", "file"],
  ["release_date", "تاریخ انتشار", "date"], ["is_published", "منتشرشده", "boolean"],
];
const planFields: readonly Field[] = [
  ["name", "نام طرح", undefined, true], ["description", "توضیحات", "textarea"],
  ["price", "قیمت", "number", true], ["duration_days", "مدت به روز", "number", true],
  ["is_active", "فعال", "boolean"],
];
const adFields: readonly Field[] = [
  ["title", "عنوان", undefined, true], ["description", "توضیحات", "textarea"],
  ["image", "تصویر", "file"], ["video", "ویدیو", "file"], ["target_url", "نشانی مقصد"],
  ["placement", "جایگاه", ["HOME", "SEARCH", "PLAYER", "ARTIST", "ALBUM", "DISCOVERY"]],
  ["pricing_model", "نوع قیمت", ["CPM", "CPC", "CPV"]], ["price", "قیمت", "number"],
  ["duration", "مدت به ثانیه", "number"], ["is_active", "فعال", "boolean"],
];

export const resources: Record<string, Resource> = {
  users: {
    title: "مدیریت کاربران", endpoint: account, search: true,
    columns: [["id", "شناسه"], ["username", "نام کاربری"], ["email", "ایمیل"], ["is_staff", "مدیر"], ["is_active", "فعال"]],
    create: { path: `${account}/create`, fields: [...identity, ["password", "رمز عبور", "password", true]] },
    edit: { path: (id) => `${account}/${id}/update`, fields: identity, method: "PUT" },
    actions: [{ label: "تغییر وضعیت", path: (id) => `${account}/${id}/toggle-active`, confirm: "وضعیت دسترسی این کاربر تغییر کند؟" }],
  },
  artists: {
    title: "مدیریت هنرمندان", endpoint: artists, search: true,
    columns: [["id", "شناسه"], ["artistname", "نام هنری"], ["username", "حساب"], ["monthly_listeners", "شنوندگان ماهانه"], ["is_featured", "ویژه"]],
    create: { path: `${artists}/create`, fields: [["user_id", "شناسهٔ حساب کاربر", "number", true], ...artistFields], multipart: true },
    edit: { path: (id) => `${artists}/${id}/update`, fields: artistFields, multipart: true, method: "PATCH" },
    actions: [{ label: "تغییر وضعیت ویژه", path: (id) => `${artists}/${id}/toggle-featured` }],
  },
  songs: {
    title: "مدیریت آهنگ‌ها", endpoint: songs, search: true,
    columns: [["id", "شناسه"], ["title", "عنوان"], ["artists", "هنرمندان"], ["play_count", "تعداد پخش"], ["is_published", "انتشار"]],
    create: { path: `${songs}/create`, fields: [...songFields, ["artist_ids", "شناسهٔ هنرمندان با ویرگول", "ids", true]], multipart: true },
    edit: { path: (id) => `${songs}/${id}/update`, fields: songFields, multipart: true, method: "PATCH" },
    actions: [{ label: "تغییر انتشار", path: (id) => `${songs}/${id}/toggle-published` },
      { label: "تغییر تأیید", path: (id) => `${songs}/${id}/toggle-verified` }],
  },
  albums: {
    title: "مدیریت آلبوم‌ها", endpoint: `${adminData}/albums`,
    columns: [["id", "شناسه"], ["title", "عنوان"], ["artist", "شناسهٔ هنرمند"], ["release_date", "تاریخ"], ["is_published", "انتشار"]],
    create: { path: `${adminData}/albums`, fields: albumFields, multipart: true },
    edit: { path: (id) => `${adminData}/albums/${id}`, fields: albumFields, multipart: true, method: "PATCH" },
  },
  playlists: {
    title: "مدیریت پلی‌لیست‌ها", endpoint: "access/playlists", id: "unique_id", search: true,
    columns: [["name", "نام"], ["username", "مالک"], ["tracks_count", "تعداد آهنگ"]],
    actions: [{ label: "حذف", path: (id) => `access/playlists/${id}`, method: "DELETE", confirm: "این پلی‌لیست حذف شود؟" }],
  },
  subscriptions: {
    title: "اشتراک‌ها", endpoint: "subscriptions/access/subscriptions", search: true,
    columns: [["username", "کاربر"], ["plan_name", "طرح"], ["status", "وضعیت"], ["expires_at", "پایان"]],
  },
  payments: {
    title: "پرداخت‌ها", endpoint: "subscriptions/access/payments", search: true,
    columns: [["user_email", "ایمیل"], ["amount", "مبلغ"], ["status", "وضعیت"], ["paid_at", "زمان پرداخت"], ["subscription_name", "اشتراک"]],
  },
  plans: {
    title: "طرح‌ها و قیمت‌ها", endpoint: plan,
    columns: [["name", "نام"], ["price", "قیمت"], ["duration_days", "مدت به روز"], ["is_active", "فعال"]],
    create: { path: plan, fields: planFields },
    edit: { path: (id) => `${plan}/${id}`, fields: planFields, method: "PATCH" },
  },
  ads: {
    title: "مدیریت تبلیغات", endpoint: ads, search: true,
    columns: [["title", "عنوان"], ["campaign_name", "کمپین"], ["ad_type", "نوع"], ["placement", "جایگاه"], ["price", "قیمت"], ["is_active", "فعال"]],
    create: { path: ads, multipart: true, fields: [...adFields, ["campaign", "شناسهٔ کمپین", undefined, true], ["ad_type", "نوع رسانه", ["IMAGE", "VIDEO"], true]] },
    edit: { path: (id) => `${ads}/${id}`, fields: adFields, multipart: true, method: "PATCH" },
    actions: [{ label: "حذف", path: (id) => `${ads}/${id}`, method: "DELETE", confirm: "این تبلیغ حذف شود؟" }],
  },
  campaigns: {
    title: "کمپین‌ها", endpoint: "ads/campaigns",
    columns: [["id", "شناسه"], ["name", "نام"], ["status", "وضعیت"], ["budget", "بودجه"], ["spent", "مصرف‌شده"]],
    create: { path: "ads/campaigns", fields: [["name", "نام", undefined, true], ["advertiser", "شناسهٔ تبلیغ‌دهنده", undefined, true],
      ["budget", "بودجه", "number"], ["start_at", "شروع", "datetime-local", true], ["end_at", "پایان", "datetime-local", true]] },
  },
  advertisers: {
    title: "تبلیغ‌دهندگان", endpoint: "ads/advertisers", columns: [["id", "شناسه"], ["name", "نام"], ["website", "وب‌سایت"]],
    create: { path: "ads/advertisers", multipart: true, fields: [["name", "نام", undefined, true], ["website", "وب‌سایت"], ["logo", "لوگو", "file"]] },
  },
  videos: {
    title: "محتوای ویدیویی", endpoint: `${adminData}/shorts`,
    columns: [["id", "شناسه"], ["caption", "عنوان"], ["views", "بازدید"], ["is_official", "رسمی"]],
    edit: { path: (id) => `${adminData}/shorts/${id}`, method: "PATCH", fields: [
      ["caption", "عنوان", "textarea"], ["is_official", "رسمی", "boolean"], ["allow_comments", "اجازهٔ دیدگاه", "boolean"],
    ] },
    actions: [{ label: "حذف", path: (id) => `${adminData}/shorts/${id}`, method: "DELETE", confirm: "این ویدیو حذف شود؟" }],
  },
  "artist-requests": {
    title: "درخواست‌های اشتراکی‌کردن آهنگ", endpoint: `${adminData}/artist-requests`,
    columns: [["artist_name", "هنرمند"], ["song_title", "آهنگ"], ["status", "وضعیت تأیید"], ["created_at", "زمان ثبت"]],
  },
  support: {
    title: "درخواست‌های پشتیبانی", endpoint: `${adminData}/support`, search: true,
    columns: [["subject", "موضوع"], ["email", "ایمیل"], ["message", "متن"], ["status", "وضعیت"]],
    edit: { path: (id) => `${adminData}/support/${id}`, method: "PATCH", fields: [
      ["status", "وضعیت", ["OPEN", "IN_PROGRESS", "ANSWERED", "CLOSED"], true],
    ] },
  },
  reports: { title: "گزارش درآمد روزانه", endpoint: "subscriptions/access/revenue/chart", columns: [["date", "تاریخ"], ["revenue", "مبلغ"]] },
};
