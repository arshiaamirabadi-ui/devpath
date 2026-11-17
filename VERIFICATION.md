# گزارش بررسی ۲۰۲۶-۱۱-۱۵

- TypeScript و Build تولید موفق شدند.
- ۲۴ تست واحد در ۶ فایل: پیشرفت، زمان‌بندی، بازیابی، پوشش ۳۹۰ ساعت، ۱۵۷ راهنمای درس، تمام ۶۵ مورد چک‌لیست، شناسه‌ها، گراف، چیدمان درختی و محاسبه دوربین.
- ۶ سناریوی مرورگر در Microsoft Edge: گردش ثبت/رفرش/خروجی/بازیابی؛ تمام ۲۶ هفته و پروژه/منابع/مرور/مهارت؛ ناوبری درخت؛ RTL و موبایل؛ توضیح درس و منبع و تمرین؛ زوم اسکرول حول نشانگر و کشیدن با دکمه وسط بدون اسکرول صفحه.
- دوربین در تست واحد نقطه زیر نشانگر را دقیق حفظ می‌کند؛ در مرورگر خطای کمتر از یک پیکسل برای گردشدن مختصات نشانگر پذیرفته می‌شود.
- درخت هر موضوع را فقط یک بار نشان می‌دهد، برای هر گره یک والد نمایشی دارد و هیچ کادری در یک ردیف روی کادر دیگر نمی‌افتد. پیش‌نیازهای مشترک در پنل موضوع حفظ شده‌اند.
- برای تمام ۱۵۷ فعالیت توضیح مفهوم، بخش منبع، مراحل اجرا و تمرین ورودی/خروجی‌دار وجود دارد. تمام ۶۵ آیتم تحویل پروژه روش ساخت، بررسی و لینک درس مرتبط دارند. بازکردن راهنما هیچ فعالیتی را تکمیل نمی‌کند.
- نمایش در اندازه‌های ۳۲۰، ۳۹۰، ۷۶۸، ۱۰۲۴ و ۱۴۴۰ بررسی شده است؛ نقشه عمداً بوم قابل حرکت دارد و صفحه سرریز افقی ندارد.
- منبع‌های اصلی حفظ شدند. لینک‌های رسمی تکمیلی Go، OWASP، Jupyter، MDN، Git و PyTorch هنگام نگارش باز شدند؛ این کار تضمین دسترسی آینده یا یکسان‌بودن نسخه نصب‌شده کاربر با مستندات نیست.

محدودیت: بررسی کامل با screen reader و مرورگر Safari/Firefox یا تمام دستگاه‌های لمسی انجام نشده است. داده شخصی هنوز روی همان origin و مرورگر است و برای انتقال بین دستگاه‌ها خروجی/بازیابی لازم است. محتوای درس‌ها جای اجرای تمرین و سنجش مهارت با شاهد را نمی‌گیرد.
# Firebase account sync (2026-11-17)

- `npm test`: 68 tests passed across 15 files.
- `npm run build`: TypeScript and production build passed.
- `npm run android:sync`: Android web build and Capacitor integration passed. Without an Android Firebase registration, the generated plugin registry excludes native Google auth so guest/email builds remain usable. A native APK build and actual Android Google sign-in were not verified in this session.
- Firestore Emulator: 4 rule tests passed, including unauthorized reads/list/writes, cross-account access, type/size/field validation, and tombstones.
- Auth + Firestore Emulator, two independent Edge contexts: 3 account browser scenarios passed (email signup/login, offline independent changes and sign-out isolation; conflicting edits and deletion; cancelled Google popup).
- Existing app/language browser scenarios: 10 passed in the combined run. The backup download scenario timed out in Edge twice; an isolated export succeeded and the complete learning/export/restore scenario then passed on focused retry. No backup-export code was changed.
- Dependency install audit: 0 vulnerabilities after overriding the Node-only gRPC dependency to the fixed 1.14.7 range.
- Production backend: user enabled email/password and published rules through the console. The user confirmed a signed-in account displaying successful sync against devpath-e0b3c. Administrative CLI login was not completed; actual multi-device Google sign-in still needs verification.
- Release 1.1.0 preflight: iPad WebKit portrait/landscape/split-view layouts passed in both languages and themes. Edge and WebKit verified the standalone manifest, offline English lessons and persistence. Android versionCode is 2; the original signing key is reused.
- Rollback: web can redeploy commit 7be2bb7. Android 1.0.0 remains downloadable; a corrective APK must use the same certificate and a versionCode above 2. Preserve Firebase records and local account caches during rollback; the previous version uses the separate guest cache and cannot display cloud account data.
