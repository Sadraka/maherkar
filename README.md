# ماهرکار - پلتفرم کاریابی و استخدام متخصصین

این پروژه یک پلتفرم کاریابی مشابه پونیشا است که با استفاده از Next.js و Material-UI (MUI) پیاده‌سازی شده است.

## تکنولوژی‌های استفاده شده

- Next.js 15.3.0
- Material-UI (MUI)
- TypeScript
- Tailwind CSS

## ویژگی‌ها

- طراحی ریسپانسیو و مدرن
- رابط کاربری RTL
- کامپوننت‌محور و قابل توسعه
- بهینه‌سازی شده برای SEO
- پشتیبانی از فونت فارسی (ایران‌سنس)

## ساختار پروژه

```
src/
├── app/
│   ├── layout.tsx      # لایوت اصلی برنامه
│   ├── page.tsx        # صفحه اصلی
│   └── globals.css     # استایل‌های سراسری
├── components/
│   ├── layout/
│   │   └── Header.tsx  # هدر سایت
│   └── home/
│       └── Hero.tsx    # بخش جستجوی صفحه اصلی
└── theme/
    └── theme.ts        # تنظیمات تم MUI
```

## نصب و راه‌اندازی

1. نصب وابستگی‌ها:
```bash
npm install
```

2. اجرای برنامه در محیط توسعه:
```bash
npm run dev
```

3. ساخت نسخه production:
```bash
npm run build
```

## تاریخچه تغییرات

### نسخه 0.1.0
- راه‌اندازی اولیه پروژه با Next.js
- اضافه کردن Material-UI و تنظیمات تم
- پیاده‌سازی هدر سایت
- پیاده‌سازی بخش جستجوی صفحه اصلی
- اضافه کردن فونت ایران‌سنس

## کامیت‌های انجام شده

1. Initial commit - Project setup
```bash
git init
git add .
git commit -m "Initial commit: Project setup with Next.js and TypeScript"
```

2. Add Material-UI
```bash
git add .
git commit -m "Add Material-UI and theme configuration"
```

3. Add Header component
```bash
git add .
git commit -m "Add responsive header component"
```

4. Add Hero section
```bash
git add .
git commit -m "Add hero section with search functionality"
```

5. Add IRANSans font
```bash
git add .
git commit -m "Add IRANSans font and RTL support"
```

## برنامه‌های آینده

- [ ] اضافه کردن بخش فرصت‌های شغلی جدید
- [ ] اضافه کردن بخش متخصصین جویای کار
- [ ] اضافه کردن بخش سوالات متداول
- [ ] پیاده‌سازی فوتر
- [ ] اتصال به بک‌اند جنگو

## مشارکت

برای مشارکت در این پروژه، لطفاً ابتدا موضوع را در بخش Issues مطرح کنید.
