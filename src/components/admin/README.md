# Admin Components

این پوشه شامل تمام کامپوننت‌های مربوط به پنل مدیریت است.

## ساختار پوشه‌ها

### 📁 `guards/`

کامپوننت‌های محافظت کننده برای بررسی دسترسی ادمین:

- `AdminGuard.tsx` - محافظت ساده برای بررسی نوع کاربر
- `AdminProtector.tsx` - محافظت پیشرفته با loading state

### 📁 `components/`

کامپوننت‌های اصلی پنل ادمین:

- `AdminStats.tsx` - داشبورد و آمار کلی
- `AdminSettings.tsx` - تنظیمات سیستم

### 📁 `management/`

صفحات مدیریت انواع مختلف داده:

- `UsersManagement.tsx` - مدیریت کاربران
- `CompaniesManagement.tsx` - مدیریت شرکت‌ها
- `JobsManagement.tsx` - مدیریت آگهی‌ها
- `ApplicationsManagement.tsx` - مدیریت درخواست‌ها
- `PaymentsManagement.tsx` - مدیریت پرداخت‌ها
- `SubscriptionsManagement.tsx` - مدیریت اشتراک‌ها

### 📁 `modals/`

مُدال‌های مورد استفاده در پنل ادمین:

- `UserDetailsModal.tsx` - نمایش جزئیات کاربر

### 📄 فایل‌های مشترک

- `types.ts` - تعریف interface های مشترک
- `utils.ts` - توابع کمکی مشترک
- `constants.ts` - ثابت‌های مشترک
- `index.ts` - export کردن همه کامپوننت‌ها

## نحوه استفاده

```tsx
// Import از پوشه اصلی
import { AdminDashboard } from "@/components/admin";

// Import از پوشه‌های خاص
import { AdminGuard } from "@/components/admin/guards";
import { UsersManagement } from "@/components/admin/management";
import { UserDetailsModal } from "@/components/admin/modals";

// Import types, utils و constants
import {
  User,
  Company,
  convertToJalali,
  getUserTypeLabel,
  USER_TYPES,
} from "@/components/admin";
```

## تم و استایل

تمام کامپوننت‌ها از `ADMIN_THEME` استفاده می‌کنند که در `@/constants/colors` تعریف شده است.

## ویژگی‌های مشترک

- **Responsive Design**: تمام کامپوننت‌ها برای موبایل و دسکتاپ بهینه شده‌اند
- **Loading States**: نمایش اسکلتون و loading مناسب
- **Error Handling**: مدیریت خطاها با toast notifications
- **Pagination**: پیجینیشن هوشمند برای لیست‌ها
- **Search & Filter**: جستجو و فیلتر پیشرفته
- **Sorting**: مرتب‌سازی بر اساس فیلدهای مختلف
