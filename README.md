# Milify

| برنامه | مسیر | توسعهٔ محلی | دامنهٔ انتشار |
| --- | --- | --- | --- |
| Main | `frontend/milify-web` | `http://localhost:3000` | `milify.ir` |
| Admin | `frontend/milify-admin` | `http://localhost:3001` | `admin.milify.ir` |
| Artist | `frontend/milify-artist` | `http://localhost:3002` | `artist.milify.ir` |
| Django | ریشهٔ پروژه و `backend/` | `http://127.0.0.1:8000` | `api.milify.ir` |

## اجرای جداگانه

در پوشهٔ برنامهٔ مورد نظر، متغیرهای `.env.example` را در `.env.local` خود تنظیم کنید و
`npm ci`، `npm run dev` یا `npm run build` را اجرا کنید. هر برنامه
`package-lock.json`، تنظیم Next.js و خروجی مستقل `.next` دارد. برای ساخت یکی از
پنل‌ها فقط پوشهٔ خودش و `frontend/panel-kit` لازم است. بستهٔ محلی
`@milify/panel-kit` شامل پوسته، فرم‌ها، جدول، کلاینت و قرارداد نشست پنل‌هاست.
Main به این بسته وابسته نیست. بعد از تغییر بستهٔ مشترک، `npm ci` را در پنل مورد
نظر اجرا کنید تا جدیدترین نسخهٔ محلی در آن نصب شود.

- Main از `API_URL` برای اتصال سرور، از `NEXT_PUBLIC_API_URL` برای URL عمومی API،
  و از `NEXT_PUBLIC_ARTIST_ORIGIN` برای پیوند به استودیوی مستقل استفاده می‌کند.
  مسیر قدیمی `/artist-studio` به استودیو هدایت می‌شود.
- Admin و Artist از `API_URL` سمت سرور و `PANEL_ORIGIN` برای مبدأ دقیق درخواست‌های
  تغییردهنده استفاده می‌کنند. برای اجرای مستقیم، `PANEL_ORIGIN` باید طرح، نام میزبان
  و پورت مرورگر را داشته باشد.
- Main و Artist هرکدام OAuth Web Client خود را دارند. مقدار
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` هنگام ساخت Main از `GOOGLE_CLIENT_ID` و هنگام ساخت
  Artist از `ARTIST_GOOGLE_CLIENT_ID` می‌آید. دامنهٔ هر فرانت‌اند را در
  Authorized JavaScript Origins همان Client ثبت کنید. Google در Artist فقط برای
  حساب دارای نمایهٔ هنرمند که قبلاً به شناسهٔ Google متصل شده وارد می‌شود. Admin
  با ایمیل و رمز عبور و حساب فعالِ دارای `is_staff` وارد می‌شود.

## نشست و API

کوکی‌های هر برنامه host-only هستند و ویژگی `HttpOnly` دارند. پنل‌ها از کوکی‌های
نام‌گذاری‌شدهٔ مستقل و `SameSite=Strict` استفاده می‌کنند. کوکی‌ها در Build تولید
`Secure` هستند. دروازهٔ Next.js فقط مقصدهای مورد استفادهٔ آن پنل را عبور می‌دهد
و JWT را در سمت سرور به Django می‌فرستد. Django نقش جاری، نوع نشست و مالکیت منبع
را بررسی می‌کند. تمدید توکن به پنل صادرکننده محدود است و خروج refresh را باطل می‌کند.
پنل‌ها برای کارکرد عادی به CORS بین زیردامنه‌ها یا Cookie Domain مشترک نیاز ندارند.

- Main همان APIهای موسیقی، پیشنهاد، کتابخانه، اشتراک، پروفایل و ورود را مصرف می‌کند.
- Admin از APIهای مدیریت کاربران، هنرمندان، آهنگ‌ها، پلی‌لیست‌ها، پرداخت‌ها،
  اشتراک‌ها و تبلیغات به‌همراه `/api/panel-data/admin/` برای آلبوم، محتوا، طرح،
  درخواست اشتراکی‌کردن آهنگ و پشتیبانی استفاده می‌کند.
- Artist از APIهای آمار و دنبال‌کنندگان، ویرایش نمایه و اشتراک و
  `/api/panel-data/artist/` برای محتوای متعلق به حساب، فروش ناخالص، طرح فروش و
  ظرفیت استفاده می‌کند. پس از پایان اشتراک حساب، فعال‌سازی دوباره از API خرید و
  کیف پول موجود انجام می‌شود.
- `MILIFY_ARTIST_SONG_LIMIT` و `MILIFY_ARTIST_VIDEO_LIMIT` سقف تعداد محتوای هر
  هنرمند هستند. مقدار خالی یعنی سقف مشخص نشده است. ظرفیت از Django خوانده می‌شود
  و هنگام آپلود نیز در تراکنش پایگاه داده بررسی می‌شود. برای بازنویسی سقف بر اساس
  طرح فعال حساب، `MILIFY_ARTIST_UPLOAD_LIMITS_BY_PLAN` را به صورت JSON بدهید.
  کلیدها شناسهٔ UUID طرح‌های موجود و مقدار هر کلید شیئی با `songs` و `videos` اختیاری است.
- API تسویه یا فرایند بررسی درخواست عضویت هنرمند در مدل فعلی وجود ندارد. صفحهٔ
  درآمد مجموع ناخالص پرداخت‌های موفق اشتراک هنرمند را نشان می‌دهد. صفحهٔ
  درخواست‌های هنرمندان وضعیت درخواست‌های اشتراکی‌کردن آهنگ را گزارش می‌کند.

## Docker و Nginx

کلید `DJANGO_SECRET_KEY` و متغیرهای اتصال پایگاه داده، Redis و Object Storage را
در محیط استقرار تعیین کنید. برای ساخت یا اجرای سرویس منفرد از
`docker compose build milify-web`، `docker compose build milify-admin` یا
`docker compose build milify-artist` و نام همان سرویس با `docker compose up`
استفاده کنید. Compose سرویس Django را پیش از استفادهٔ برنامه بالا می‌آورد.
در توسعهٔ مستقیم با Compose می‌توانید `MILIFY_ADMIN_ORIGIN` را
`http://localhost:3001` و `MILIFY_ARTIST_ORIGIN` را `http://localhost:3002` قرار دهید.

فایل `deploy/nginx.conf` چهار دامنه را به سرویس‌های جدول نگاشت می‌کند.
گواهی مشترک شامل چهار نام را با فایل‌های `fullchain.pem` و `privkey.pem`
در مسیر `MILIFY_TLS_DIR` قرار دهید و `docker compose --profile ingress up -d` را
اجرا کنید. پورت‌های مستقیم Compose روی loopback قرار دارند. هنگام تغییر دامنه،
مبدأ پنل، Origin گوگل و نام میزبان مجاز Django را هم‌زمان به‌روزرسانی کنید.

## بررسی

در هر برنامه `npm run build` را اجرا کنید. در پنل‌ها `npm test` نوع‌های Route و
TypeScript را بررسی می‌کند. Main دستورهای `npm run lint` و `npm test` را از
نسخهٔ اصلی دارد. در ریشهٔ پروژه `python manage.py test` آزمون‌های Django،
نقش‌ها، جداسازی و تمدید نشست، مالکیت محتوا و کنترل ظرفیت را اجرا می‌کند.
