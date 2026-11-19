export const links = [
  ["/", "داشبورد"], ["/profile", "نمایهٔ هنرمند"], ["/songs", "آهنگ‌ها"],
  ["/videos", "ویدیوهای کوتاه"], ["/albums", "آلبوم‌ها"], ["/followers", "دنبال‌کنندگان"],
  ["/subscription", "اشتراک"], ["/revenue", "درآمد و ظرفیت"], ["/settings", "تنظیمات حساب"],
] as const;

export const allowedPaths = /^(?:me|permissions\/(?:profile|change-password)|artists2\/[^/]+|dashboard\/[^/]+(?:\/followers-chart)?|subscriptions\/(?:me|plans|purchase)|panel-data\/artist\/(?:commercial|plan|(?:songs|shorts|albums)(?:\/[0-9]+)?))$/;
