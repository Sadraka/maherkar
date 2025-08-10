import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// نام کوکی‌های مورد استفاده در سیستم - همانند تعاریف در cookieService.ts
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REDIRECT_PATH: 'redirect_path' // کوکی جدید برای ذخیره مسیر
};

// مسیرهایی که نیاز به احراز هویت دارند
const protectedPaths = [
  '/profile',
  '/dashboard',
  '/projects',
  '/messages'
];

// مسیرهایی که کاربر احراز هویت شده نباید به آنها دسترسی داشته باشد
const authPaths = ['/login', '/register'];

// مسیرهایی که نیاز به احراز هویت ندارند (مسیرهای دسترسی عمومی)
const publicPaths = ['/login', '/register', '/terms', '/privacy'];

export function middleware(request: NextRequest) {
  // بررسی وجود توکن دسترسی
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const isAuthenticated = !!accessToken;
  const path = request.nextUrl.pathname;
  
  // بررسی محیط تولید
  const isProduction = process.env.NODE_ENV === 'production';
  
  // اگر مسیر محافظت شده است و کاربر احراز هویت نشده است
  if (protectedPaths.some(p => path.startsWith(p)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    
    // ایجاد پاسخ redirect
    const response = NextResponse.redirect(loginUrl);
    
    // ذخیره مسیر فعلی در کوکی با مدت زمان انقضای 5 دقیقه
    response.cookies.set({
      name: COOKIE_NAMES.REDIRECT_PATH,
      value: path,
      maxAge: 5 * 60, // 5 دقیقه
      path: '/',
      sameSite: 'lax',
      secure: isProduction // فقط در محیط تولید فعال می‌شود
    });
    
    return response;
  }
  
  // اگر کاربر احراز هویت شده است و سعی دارد به صفحات ورود/ثبت‌نام برود
  if (authPaths.some(p => path === p) && isAuthenticated) {
    // بررسی آیا مسیر redirect قبلاً ذخیره شده است
    const redirectPath = request.cookies.get(COOKIE_NAMES.REDIRECT_PATH)?.value || '/';
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // پاک کردن کوکی redirect path
    response.cookies.delete(COOKIE_NAMES.REDIRECT_PATH);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  // تنظیم matcher برای مسیرهایی که می‌خواهیم middleware اجرا شود
  matcher: [
    // مسیرهای محافظت شده
    '/profile/:path*',
    '/dashboard/:path*',
    '/projects/:path*',
    '/messages/:path*',
    // مسیرهای ورود و ثبت‌نام
    '/login',
    '/register',
  ],
}; 