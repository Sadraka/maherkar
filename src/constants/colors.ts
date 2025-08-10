// تعریف رنگ‌های اصلی پروژه که می‌توانند در کل پروژه استفاده شوند

// رنگ‌های کارجو - نسخه جدید با سبز روشن‌تر
export const JOB_SEEKER_GREEN = '#0a9b54'; // سبز روشن‌تر و شادتر
export const JOB_SEEKER_LIGHT_GREEN = '#23b76b'; // سبز خیلی روشن
export const JOB_SEEKER_DARK_GREEN = '#007a40'; // سبز تیره
export const JOB_SEEKER_BG_LIGHT = 'rgba(10, 155, 84, 0.15)'; // سبز با شفافیت کم برای پس‌زمینه
export const JOB_SEEKER_BG_VERY_LIGHT = 'rgba(10, 155, 84, 0.08)'; // سبز با شفافیت خیلی کم
export const JOB_SEEKER_CONTRAST = 'rgb(255, 140, 0)'; // نارنجی متضاد با سبز

// رنگ‌های کارفرما - نسخه جدید با آبی روشن
export const EMPLOYER_BLUE = 'rgb(65, 135, 255)'; // آبی روشن
export const EMPLOYER_LIGHT_BLUE = 'rgb(125, 175, 255)'; // آبی خیلی روشن‌تر
export const EMPLOYER_DARK_BLUE = 'rgb(35, 95, 215)'; // آبی تیره‌تر
export const EMPLOYER_BG_LIGHT = 'rgba(65, 135, 255, 0.15)'; // آبی با شفافیت کم
export const EMPLOYER_BG_VERY_LIGHT = 'rgba(65, 135, 255, 0.08)'; // آبی با شفافیت خیلی کم
export const EMPLOYER_CONTRAST = 'rgb(255, 110, 60)'; // نارنجی متضاد با آبی

// رنگ‌های عمومی
export const RED = '#d32f2f'; // قرمز برای آگهی‌های ویژه و خطاها
export const RED_LIGHT = 'rgba(211, 47, 47, 0.1)'; // قرمز با شفافیت کم

// تعریف تم کارجو در یک آبجکت برای استفاده آسان‌تر
export const JOB_SEEKER_THEME = {
  primary: JOB_SEEKER_GREEN,
  light: JOB_SEEKER_LIGHT_GREEN,
  dark: JOB_SEEKER_DARK_GREEN,
  bgLight: JOB_SEEKER_BG_LIGHT,
  bgVeryLight: JOB_SEEKER_BG_VERY_LIGHT,
  contrast: JOB_SEEKER_CONTRAST,
  red: RED
};

// تعریف تم کارفرما در یک آبجکت برای استفاده آسان‌تر
export const EMPLOYER_THEME = {
  primary: EMPLOYER_BLUE,
  light: EMPLOYER_LIGHT_BLUE,
  dark: EMPLOYER_DARK_BLUE,
  bgLight: EMPLOYER_BG_LIGHT,
  bgVeryLight: EMPLOYER_BG_VERY_LIGHT,
  contrast: EMPLOYER_CONTRAST,
  red: RED
};

// رنگ‌های ادمین - بنفش روشن‌تر با آبی
export const ADMIN_RED = '#7c3aed'; // بنفش روشن‌تر
export const ADMIN_LIGHT_RED = '#6366f1'; // آبی
export const ADMIN_DARK_RED = '#6d28d9'; // بنفش تیره‌تر
export const ADMIN_BG_LIGHT = 'rgba(124, 58, 237, 0.15)'; // بنفش با شفافیت کم
export const ADMIN_BG_VERY_LIGHT = 'rgba(124, 58, 237, 0.08)'; // بنفش با شفافیت خیلی کم

// رنگ‌های پشتیبان - نارنجی گرم
export const SUPPORT_ORANGE = '#f97316'; // نارنجی گرم
export const SUPPORT_LIGHT_ORANGE = '#fb923c'; // نارنجی روشن
export const SUPPORT_DARK_ORANGE = '#ea580c'; // نارنجی تیره
export const SUPPORT_BG_LIGHT = 'rgba(249, 115, 22, 0.15)'; // نارنجی با شفافیت کم
export const SUPPORT_BG_VERY_LIGHT = 'rgba(249, 115, 22, 0.08)'; // نارنجی با شفافیت خیلی کم

// تعریف تم ادمین
export const ADMIN_THEME = {
  primary: ADMIN_RED,
  light: ADMIN_LIGHT_RED,
  dark: ADMIN_DARK_RED,
  bgLight: ADMIN_BG_LIGHT,
  bgVeryLight: ADMIN_BG_VERY_LIGHT,
  border: 'rgba(124, 58, 237, 0.2)',
};

// تعریف تم پشتیبان
export const SUPPORT_THEME = {
  primary: SUPPORT_ORANGE,
  light: SUPPORT_LIGHT_ORANGE,
  dark: SUPPORT_DARK_ORANGE,
  bgLight: SUPPORT_BG_LIGHT,
  bgVeryLight: SUPPORT_BG_VERY_LIGHT,
}; 