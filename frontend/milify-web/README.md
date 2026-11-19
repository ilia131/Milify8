This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




🔹 جمع‌بندی وضعیت فاز ۱
فاز	وضعیت
Smoke Test	✅ ✅ ✅
Static UI Test	✅ ✅ ✅
DisplayName برای mocks	✅ ✅ ✅

نتیجه: فاز ۱ کاملاً پاس شده و صفحه “safe” برای ادامه تست‌هاست.

🔹 قدم بعدی برای صفحه اول (فاز ۲ و بعدی)
فاز ۲: User Interaction & Conditional Rendering

بررسی click / hover / focus

تست loading / empty state / error state

بررسی اینکه props واقعی (mocked data) درست رندر میشه

فاز ۳: Data-driven UI

استفاده از داده mock برای CardSection / CardSlider / MoreLikeCard

مطمئن شدن که لیست‌ها و تصاویر درست رندر شدن

فاز ۴: Integration / E2E (بعداً)

وقتی API واقعی یا MSW اضافه شد

تست contract بین فرانت و بک

edge cases واقعی
## اجرای Milify و تنظیم ورود گوگل

فرانت‌اند از مسیر محلی `/backend-api/` به Django دسترسی دارد. در زمان Build مقدار
`API_URL` را به نشانی داخلی Django و `NEXT_PUBLIC_API_URL` را به نشانی عمومی API بدهید.
در توسعهٔ محلی، می‌توانید هر دو را `http://127.0.0.1:8000` تنظیم کنید.

- یک OAuth Client از نوع **Web application** در Google Cloud بسازید. مبدأهای دقیق فرانت‌اند را در **Authorized JavaScript origins** وارد کنید، مانند `https://milify.ir` و `http://localhost:3000` برای توسعه.
- همان Client ID را در `NEXT_PUBLIC_GOOGLE_CLIENT_ID` هنگام Build فرانت‌اند و `GOOGLE_CLIENT_ID` در محیط Django تنظیم کنید. دکمهٔ Google Identity Services یک ID token را در پنجرهٔ ورود دریافت می‌کند و سرور امضا، مخاطب، صادرکننده و انقضای آن را بررسی می‌کند. این جریان به Client Secret یا callback اپلیکیشن نیاز ندارد.
- `DJANGO_SECRET_KEY`، `DJANGO_ALLOWED_HOSTS`، PostgreSQL و Redis را در محیط Django تنظیم کنید. اگر مبدأ فرانت‌اند با تنظیمات پیش‌فرض فرق دارد، آن را در `MILIFY_EXTRA_ORIGINS` وارد کنید. مبدأ ایمیل بازیابی را با `MILIFY_FRONTEND_DOMAIN` و `MILIFY_FRONTEND_PROTOCOL` و اعتبار SMTP را با `EMAIL_HOST_USER` و `EMAIL_HOST_PASSWORD` تنظیم کنید.
- `python manage.py migrate` را برای شناسهٔ حساب گوگل و فهرست ابطال JWT اجرا کنید. برای استقرار، HTTPS و Object Storage خصوصی با دسترسی امضاشده به رسانه را فعال کنید. کلیدهای قدیمی مخزن را در محیط استقرار چرخش دهید.

ثبت‌نام جدید مستقیماً حساب فعال می‌سازد. کاربران دارای رمز عبور می‌توانند پس از ورود،
حساب گوگل با ایمیل یکسان را از تنظیمات متصل کنند. حساب‌های غیرفعال به‌صورت خودکار فعال نمی‌شوند.
مسیر `/activate` فقط پیوندهای قبلاً صادرشده را پردازش می‌کند. ایمیل بازیابی رمز عبور از لینک بازیابی استفاده می‌کند.

برای بررسی محلی `npm ci`، `npm run build` و `npm run lint` را در `frontend`
و `python manage.py check` و `python manage.py test` را در ریشهٔ پروژه اجرا کنید.
