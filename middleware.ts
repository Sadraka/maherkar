import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// نام کوکی‌های مورد استفاده در سیستم - همانند تعاریف در cookieService.ts
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

// مسیرهایی که نیاز به احراز هویت دارند
const protectedPaths = [
  '/profile',
  '/dashboard',
  '/projects',
  '/settings',
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
  
  // اگر مسیر محافظت شده است و کاربر احراز هویت نشده است
  if (protectedPaths.some(p => path.startsWith(p)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // اضافه کردن مسیر فعلی به عنوان پارامتر برای بازگشت پس از ورود
    loginUrl.searchParams.set('redirect', encodeURIComponent(path));
    return NextResponse.redirect(loginUrl);
  }
  
  // اگر کاربر احراز هویت شده است و سعی دارد به صفحات ورود/ثبت‌نام برود
  if (authPaths.some(p => path === p) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
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
    '/settings/:path*',
    '/messages/:path*',
    // مسیرهای ورود و ثبت‌نام
    '/login',
    '/register',
  ],
}; 