export const links = [
  ["/", "داشبورد"], ["/users", "کاربران"], ["/artists", "هنرمندان"],
  ["/songs", "آهنگ‌ها"], ["/albums", "آلبوم‌ها"], ["/playlists", "پلی‌لیست‌ها"],
  ["/subscriptions", "اشتراک‌ها"], ["/payments", "پرداخت‌ها"], ["/plans", "طرح و قیمت"],
  ["/ads", "تبلیغات"], ["/campaigns", "کمپین‌ها"], ["/advertisers", "تبلیغ‌دهندگان"],
  ["/videos", "محتوای ویدیویی"], ["/artist-requests", "درخواست هنرمندان"], ["/support", "پشتیبانی"], ["/reports", "گزارش‌ها"],
  ["/settings", "تنظیمات حساب"],
] as const;

export const allowedPaths = /^(?:me|permissions\/(?:change-password|admin\/users(?:\/(?:create|[0-9]+\/(?:update|password|toggle-active|delete)))?)|admin\/artists(?:\/(?:create|[0-9]+\/(?:update|toggle-featured|toggle-active)))?|access\/(?:songs(?:\/(?:create|[0-9]+\/(?:update|toggle-published|toggle-verified)))?|playlists(?:\/[a-f0-9-]+)?)|subscriptions\/access\/(?:payments|subscriptions|revenue(?:\/chart)?)|ads\/(?:advertisers|campaigns|access\/ads(?:\/[a-f0-9-]+)?)|panel-data\/admin\/(?:albums|shorts|plans|support|artist-requests)(?:\/[a-f0-9-]+)?)$/;
