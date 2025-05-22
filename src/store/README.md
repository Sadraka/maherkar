# راهنمای مدیریت State با Zustand

## مقدمه

این پروژه از [Zustand](https://github.com/pmndrs/zustand) برای مدیریت state استفاده می‌کند. Zustand یک کتابخانه مدیریت state برای React است که بر سادگی، کارایی و اندازه کوچک متمرکز است.

## ساختار پوشه‌ها

```
src/
├── store/           # همه store ها در این پوشه قرار دارند
│   ├── index.ts     # re-export همه store ها
│   ├── authStore.ts # مدیریت احراز هویت
│   └── README.md    # این فایل راهنما
└── contexts/
    └── AuthContext.tsx # لایه سازگاری برای کدهای قدیمی
```

## Store های موجود

### 1. authStore

این store برای مدیریت همه موارد مربوط به احراز هویت کاربر استفاده می‌شود.

#### state ها
- `isAuthenticated`: وضعیت احراز هویت کاربر
- `user`: اطلاعات کاربر جاری
- `loading`: وضعیت بارگذاری عملیات احراز هویت
- `loginError`: خطای مربوط به ورود
- `registerError`: خطای مربوط به ثبت‌نام
- `verifyError`: خطای مربوط به تایید OTP

#### Action ها (توابع تغییر state)
- `setUser`: تنظیم اطلاعات کاربر
- `setIsAuthenticated`: تنظیم وضعیت احراز هویت
- `setLoading`: تنظیم وضعیت بارگذاری
- `clearErrors`: پاک کردن همه خطاها
- `setLoginError`: تنظیم خطای ورود
- `setRegisterError`: تنظیم خطای ثبت‌نام
- `setVerifyError`: تنظیم خطای تایید OTP

#### Thunk ها (توابع ناهمگام)
- `loginOtp`: ارسال درخواست دریافت کد OTP برای ورود
- `validateLoginOtp`: تایید کد OTP برای ورود
- `logout`: خروج از حساب کاربری
- `registerOtp`: ارسال درخواست دریافت کد OTP برای ثبت‌نام
- `validateOtp`: تایید کد OTP برای ثبت‌نام
- `checkPhoneExists`: بررسی وجود شماره تلفن در سیستم
- `updateUserType`: بروزرسانی نوع کاربر
- `refreshUserData`: بازخوانی اطلاعات کاربر از سرور
- `fetchUserData`: دریافت اطلاعات کاربر از سرور

## مکانیزم‌های بهینه‌سازی و جلوگیری از حلقه بی‌نهایت

برای جلوگیری از فراخوانی‌های مکرر API و حلقه‌های بی‌نهایت، مکانیزم‌های زیر پیاده‌سازی شده‌اند:

### 1. کنترل همزمانی فراخوانی‌ها
- استفاده از متغیر `isUserDataFetchInProgress` برای جلوگیری از فراخوانی‌های همزمان API
- بررسی وضعیت `loading` قبل از شروع فراخوانی جدید

### 2. محدود کردن فراخوانی‌های مکرر (Throttling)
- استفاده از timestamp برای محدود کردن تعداد فراخوانی‌ها در بازه زمانی مشخص
- فاصله حداقل 2 ثانیه بین فراخوانی‌های `fetchUserData`
- فاصله حداقل 5 ثانیه بین فراخوانی‌های `refreshUserData`

### 3. کامپوننت AuthInitializer
- مدیریت مرکزی بررسی وضعیت احراز هویت در زمان بارگذاری اولیه برنامه
- فراخوانی `fetchUserData` فقط یک بار در زمان لود اولیه برنامه
- جلوگیری از فراخوانی‌های متعدد و تکراری در کامپوننت‌های مختلف

## لایه سازگاری برای کدهای قدیمی

برای حفظ سازگاری با کدهای موجود، یک لایه سازگاری در فایل `src/contexts/AuthContext.tsx` ایجاد شده است که از Zustand در پشت صحنه استفاده می‌کند:

### AuthProvider
- کامپوننتی که در `layout.tsx` قرار می‌گیرد و Context API را در اختیار کامپوننت‌های فرزند قرار می‌دهد
- داخلاً از هوک‌های Zustand استفاده می‌کند

### هوک‌های سازگار
- `useAuth`: معادل Context API برای دسترسی به حالت احراز هویت و کاربر
- `useAuthContext`: هوک اصلی برای دسترسی به همه امکانات Context

## مهاجرت از Context API به Zustand

برای انتقال تدریجی از Context API به Zustand، مراحل زیر را دنبال کنید:

### 1. مهاجرت کامپوننت‌های جدید
- برای کامپوننت‌های جدید، مستقیماً از هوک‌های Zustand استفاده کنید
- کامپوننت‌های جدید نباید به Context API وابسته باشند

### 2. مهاجرت کامپوننت‌های موجود
- ابتدا import های مربوط به Context API را شناسایی کنید:
```tsx
// قبل
import { useAuth } from '@/contexts/AuthContext';

// بعد
import { useAuth } from '@/store/authStore';
```

- سپس استفاده‌های آن را بر اساس نوع استفاده تغییر دهید:
```tsx
// قبل - استفاده از Context
const { isAuthenticated, user, logout } = useAuth();

// بعد - استفاده از هوک‌های راحتی Zustand
const { isAuthenticated, user } = useAuth();
const { logout } = useAuthActions();
```

### 3. تست و اطمینان از عملکرد صحیح
- پس از هر تغییر، برنامه را تست کنید تا از عملکرد صحیح آن اطمینان حاصل کنید
- توجه به رفتار render مجدد کامپوننت‌ها داشته باشید تا بهینه‌سازی‌های Zustand را از دست ندهید

### 4. در نهایت
- پس از مهاجرت کامل همه کامپوننت‌ها، می‌توانید لایه سازگاری AuthContext را حذف کنید
- نیازی به وجود AuthProvider در layout نخواهد بود

## نحوه استفاده

### import کردن store ها

```tsx
// روش 1: import از فایل store مربوطه
import { useAuthStore } from '@/store/authStore';

// روش 2: import از index
import { useAuthStore } from '@/store';
```

### استفاده از state های store

```tsx
// دسترسی به کل state
const state = useAuthStore();

// انتخاب فقط state های مورد نیاز (بهینه‌تر)
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
const user = useAuthStore(state => state.user);

// انتخاب چند state در یک زمان
const { isAuthenticated, user } = useAuthStore(state => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user
}));
```

### استفاده از action ها

```tsx
// دسترسی به action ها
const logout = useAuthStore(state => state.logout);
const setUser = useAuthStore(state => state.setUser);

// استفاده از action ها
const handleLogout = () => {
  logout();
};

const updateUser = (newUserData) => {
  setUser(newUserData);
};
```

### استفاده از هوک‌های راحتی

برای دسترسی آسان‌تر به state ها و action ها، هوک‌های راحتی ایجاد شده‌اند:

```tsx
import { useAuth, useAuthActions, useAuthStatus } from '@/store/authStore';

// در کامپوننت
const { isAuthenticated, user } = useAuth();
const { loginOtp, validateLoginOtp, logout } = useAuthActions();
const { loading, loginError } = useAuthStatus();
```

## بهینه‌سازی رندر کامپوننت‌ها

برای کاهش رندرهای غیرضروری در کامپوننت‌ها، از تکنیک‌های زیر استفاده شده است:

### 1. استفاده از selector‌های جداگانه
```tsx
// به جای این (باعث رندر مجدد با هر تغییر در store می‌شود)
const { user, isAuthenticated } = useAuthStore(state => ({ 
  user: state.user, 
  isAuthenticated: state.isAuthenticated 
}));

// از این استفاده کنید (فقط با تغییر در state های انتخاب شده رندر مجدد می‌شود)
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
```

### 2. استفاده از memo
```tsx
// برای کامپوننت‌های بزرگ که به کرات رندر می‌شوند
import { memo } from 'react';

function MyComponent() {
  // ...
}

export default memo(MyComponent);
```

## بهینه‌سازی و پیشگیری از حلقه‌های بی‌نهایت

### حذف ذخیره‌سازی اطلاعات کاربر در کوکی

* **جایگزینی روش ذخیره‌سازی**: به جای ذخیره اطلاعات کاربر در کوکی، فقط توکن‌های `access_token` و `refresh_token` در کوکی ذخیره می‌شوند.
* **دریافت مکرر اطلاعات**: هر بار که نیاز به اطلاعات کاربر باشد، با استفاده از توکن‌های موجود، اطلاعات از سرور دریافت می‌شود.
* **مزایای امنیتی**: با این روش، اطلاعات حساس کاربر به صورت دائمی در مرورگر ذخیره نمی‌شود و همیشه داده‌های به‌روز از سرور دریافت می‌شود.
* **مدیریت بهتر توکن**: با استفاده از `validateAndRefreshTokenIfNeeded`، توکن‌ها به صورت خودکار قبل از منقضی شدن، بازیابی می‌شوند.

### بهینه‌سازی فراخوانی‌های API

* **متغیر کنترل همزمانی**: از متغیر `isUserDataFetchInProgress` برای جلوگیری از فراخوانی‌های همزمان API استفاده می‌شود.
* **محدودیت زمانی (Throttling)**: با استفاده از `lastUserDataFetch`، از فراخوانی‌های مکرر و پی‌درپی API جلوگیری می‌شود.
* **کامپوننت اختصاصی**: از `AuthInitializer` برای مدیریت متمرکز فراخوانی‌های مربوط به احراز هویت استفاده می‌شود.
* **به‌روزرسانی دوره‌ای**: کامپوننت `AuthInitializer` به صورت دوره‌ای (هر 15 دقیقه) توکن‌ها را بررسی و در صورت نیاز بازیابی می‌کند.

### بهبود مدیریت خطا

* **مدیریت خطای HTTP**: خطاهای مختلف HTTP (401، 403، 404، 500) شناسایی و به درستی مدیریت می‌شوند.
* **خطاهای شبکه**: در صورت بروز خطاهای شبکه، پیام‌های خطای مناسب به زبان فارسی نمایش داده می‌شود.
* **تلاش مجدد هوشمند**: در صورت منقضی شدن توکن، به صورت خودکار از refresh token برای گرفتن توکن جدید استفاده می‌شود.

## بهترین شیوه‌ها

1. **از انتخاب دقیق state ها استفاده کنید**: به جای import کردن کل store، فقط state هایی که نیاز دارید را انتخاب کنید تا از رندر مجدد غیرضروری جلوگیری شود.

2. **از Zustand middleware ها استفاده کنید**: برای قابلیت‌های خاص مانند ذخیره‌سازی در localStorage از middleware استفاده کنید.

3. **از devtools استفاده کنید**: در محیط توسعه، از `devtools` middleware برای خطایابی بهتر استفاده کنید:
```tsx
import { devtools } from 'zustand/middleware';
export const useStore = create(devtools(store));
```

4. **Store ها را تقسیم کنید**: برای پروژه‌های بزرگ، منطق مربوط به دامنه‌های مختلف را در Store های جداگانه قرار دهید.

5. **از AuthInitializer استفاده کنید**: برای مدیریت مرکزی احراز هویت اولیه، این کامپوننت را در layout اصلی برنامه قرار دهید.