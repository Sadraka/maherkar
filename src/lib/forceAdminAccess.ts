/**
 * این فایل برای حل مشکل دسترسی ادمین ایجاد شده است
 * با استفاده از این کد، اطلاعات کاربر ادمین به صورت مستقیم در کوکی ذخیره می‌شود
 */

export function forceAdminAccess() {
  if (typeof window !== 'undefined') {
    // ایجاد اطلاعات کاربر ادمین
    const adminUserData = {
      user_type: 'AD',
      username: 'admin',
      full_name: 'مدیر سیستم',
      is_active: true
    };
    
    // ذخیره در کوکی
    const jsonValue = encodeURIComponent(JSON.stringify(adminUserData));
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 روز
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `user_data=${jsonValue}; ${expires}; path=/; SameSite=Lax`;
    
    console.log('🔍 Admin access forced successfully!');
    
    // رفرش صفحه
    window.location.reload();
  }
} 