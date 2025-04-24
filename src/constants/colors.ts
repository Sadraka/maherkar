// تعریف رنگ‌های اصلی پروژه که می‌توانند در کل پروژه استفاده شوند

// رنگ‌های کارجو
export const JOB_SEEKER_GREEN = '#00703c'; // سبز تیره و جذاب
export const JOB_SEEKER_LIGHT_GREEN = '#008a47'; // سبز روشن‌تر
export const JOB_SEEKER_DARK_GREEN = '#005530'; // سبز خیلی تیره
export const JOB_SEEKER_BG_LIGHT = 'rgba(0, 112, 60, 0.1)'; // سبز با شفافیت کم برای پس‌زمینه
export const JOB_SEEKER_BG_VERY_LIGHT = 'rgba(0, 112, 60, 0.08)'; // سبز با شفافیت خیلی کم

// رنگ‌های کارفرما
export const EMPLOYER_BLUE = '#0a3b79'; // سرمه‌ای
export const EMPLOYER_LIGHT_BLUE = '#2957a4'; // سرمه‌ای روشن‌تر
export const EMPLOYER_DARK_BLUE = '#062758'; // سرمه‌ای تیره‌تر
export const EMPLOYER_BG_LIGHT = 'rgba(10, 59, 121, 0.1)'; // سرمه‌ای با شفافیت کم
export const EMPLOYER_BG_VERY_LIGHT = 'rgba(10, 59, 121, 0.08)'; // سرمه‌ای با شفافیت خیلی کم

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
  red: RED
};

// تعریف تم کارفرما در یک آبجکت برای استفاده آسان‌تر
export const EMPLOYER_THEME = {
  primary: EMPLOYER_BLUE,
  light: EMPLOYER_LIGHT_BLUE,
  dark: EMPLOYER_DARK_BLUE,
  bgLight: EMPLOYER_BG_LIGHT,
  bgVeryLight: EMPLOYER_BG_VERY_LIGHT,
  red: RED
}; 