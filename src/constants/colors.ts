// تعریف رنگ‌های اصلی پروژه که می‌توانند در کل پروژه استفاده شوند

// رنگ‌های کارجو - نسخه جدید با سبز روشن‌تر
export const JOB_SEEKER_GREEN = '#0a9b54'; // سبز روشن‌تر و شادتر
export const JOB_SEEKER_LIGHT_GREEN = '#23b76b'; // سبز خیلی روشن
export const JOB_SEEKER_DARK_GREEN = '#007a40'; // سبز تیره
export const JOB_SEEKER_BG_LIGHT = 'rgba(10, 155, 84, 0.15)'; // سبز با شفافیت کم برای پس‌زمینه
export const JOB_SEEKER_BG_VERY_LIGHT = 'rgba(10, 155, 84, 0.08)'; // سبز با شفافیت خیلی کم

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