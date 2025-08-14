/**
 * وضعیت‌های مختلف آگهی شغلی (مطابق با بک‌اند)
 */
export enum JobStatus {
  PENDING = 'P',                      // در انتظار تایید ادمین
  APPROVED = 'A',                     // تایید شده
  REJECTED = 'R'                      // رد شده
}

/**
 * وضعیت‌های سفارش پرداخت (مطابق با بک‌اند)
 */
export enum OrderStatus {
  PENDING = 'pending',                // در انتظار پرداخت
  PAID = 'paid',                      // پرداخت شده
  CANCELED = 'canceled',              // لغو شده
  FAILED = 'failed'                   // ناموفق
}

/**
 * وضعیت‌های اشتراک آگهی (مطابق با بک‌اند)
 */
export enum SubscriptionStatus {
  DEFAULT = 'default',                // پیش‌فرض
  SPECIAL = 'special'                 // خاص
}

/**
 * نوع‌های آگهی (مطابق با بک‌اند)
 */
export enum AdType {
  JOB = 'J',                          // آگهی شغلی
  RESUME = 'R'                        // رزومه
}

/**
 * اینترفیس طرح اشتراک (مطابق با بک‌اند SubscriptionPlan)
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  active: boolean;
  is_free: boolean;
  plan_type: 'B' | 'J' | 'R';
  created_at: string;
  updated_at: string;
}

/**
 * اینترفیس اشتراک آگهی (مطابق با بک‌اند AdvertisementSubscription)
 */
export interface AdvertisementSubscription {
  id: string;
  subscription_status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  duration: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * اینترفیس آگهی کلی (مطابق با بک‌اند Advertisement)
 */
export interface Advertisement {
  id: string;
  subscription: AdvertisementSubscription;
  ad_type: AdType;
  created_at: string;
  updated_at: string;
}

/**
 * اینترفیس آگهی شغلی (مطابق با بک‌اند JobAdvertisement)
 */
export interface JobAdvertisement {
  id: string;
  advertisement: {
    id: string;
    ad_type: 'J' | 'R';
    subscription: {
      id: string;
      subscription_status: 'default' | 'special';
      plan: any;
      duration: number;
      start_date: string;
      end_date: string;
    };
    created_at: string;
    updated_at: string;
  };
  company: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    banner?: string;
    industry?: {
      id: number;
      name: string;
    };
    location?: {
      id: number;
      name: string;
      province?: {
        id: number;
        name: string;
      };
    };
    number_of_employees?: number;
    created_at: string;
  };
  employer: {
    id: string;
    full_name: string;
    phone: string;
    user_type: string;
  };
  industry: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
  location: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  title: string;
  description?: string;
  status: 'P' | 'A' | 'R'; // P=در حال بررسی، A=تایید شده، R=رد شده
  gender?: 'M' | 'F' | 'N'; // M=مرد، F=زن، N=مهم نیست
  soldier_status?: 'CO' | 'EE' | 'NS'; // CO=پایان خدمت، EE=معافیت تحصیلی، NS=مهم نیست
  degree?: 'BD' | 'DI' | 'AS' | 'BA' | 'MA' | 'DO'; // BD=زیر دیپلم، DI=دیپلم، AS=فوق دیپلم، BA=لیسانس، MA=فوق لیسانس، DO=دکترا
  salary?: '5_to_10' | '10_to_15' | '15_to_20' | '20_to_30' | '30_to_50' | 'more_than_50' | 'negotiable';
  job_type?: 'FT' | 'PT' | 'RE' | 'IN'; // FT=تمام وقت، PT=پاره وقت، RE=دورکاری، IN=کارآموزی
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  company_id: string;
  industry_id: string;
  title: string;
  description?: string;
  gender?: 'M' | 'F' | 'N';
  soldier_status?: 'CO' | 'EE' | 'NS';
  degree?: 'BD' | 'DI' | 'AS' | 'BA' | 'MA' | 'DO';
  salary?: '5_to_10' | '10_to_15' | '15_to_20' | '20_to_30' | '30_to_50' | 'more_than_50' | 'negotiable';
  job_type?: 'FT' | 'PT' | 'RE' | 'IN';
}

export interface JobFormInputs {
  company_id: string;
  industry_id: string;
  title: string;
  description: string;
  gender: string;
  soldier_status: string;
  degree: string;
  salary: string;
  job_type: string;
}

// Job Applications
export interface JobApplication {
  id: string;
  job_seeker: {
    id: string;
    full_name: string;
    phone: string;
  };
  advertisement: JobAdvertisement;
  cover_letter: string;
  resume?: {
    id: string;
    // Add resume fields if needed
  };
  status: 'PE' | 'IR' | 'AC' | 'RE'; // PE=در انتظار، IR=در حال بررسی، AC=پذیرفته شده، RE=رد شده
  employer_notes?: string;
  viewed_by_employer: boolean;
  created_at: string;
  updated_at: string;
}

// Constants for choices
export const GENDER_CHOICES = {
  M: 'آقا',
  F: 'خانم',
  N: 'مهم نیست'
} as const;

export const SOLDIER_STATUS_CHOICES = {
  CO: 'پایان خدمت',
  EE: 'معافیت تحصیلی',
  NS: 'مهم نیست'
} as const;

export const DEGREE_CHOICES = {
  BD: 'زیر دیپلم',
  DI: 'دیپلم',
  AS: 'فوق دیپلم',
  BA: 'لیسانس',
  MA: 'فوق لیسانس',
  DO: 'دکترا'
} as const;

export const SALARY_CHOICES = {
  '5 to 10': "۵ تا ۱۰ میلیون تومان",
  '10 to 15': '۱۰ تا ۱۵ میلیون تومان',
  '15 to 20': '۱۵ تا ۲۰ میلیون تومان',
  '20 to 30': '۲۰ تا ۳۰ میلیون تومان',
  '30 to 50': '۳۰ تا ۵۰ میلیون تومان',
  'More than 50': 'بیش از ۵۰ میلیون تومان',
  'Negotiable': 'توافقی'
} as const;

export const JOB_TYPE_CHOICES = {
  FT: 'تمام وقت',
  PT: 'پاره وقت', 
  RE: 'دورکاری',
  IN: 'کارآموزی'
} as const;

export const JOB_STATUS_CHOICES = {
  P: 'در حال بررسی',
  A: 'تایید شده',
  R: 'رد شده'
} as const;

export const APPLICATION_STATUS_CHOICES = {
  PE: 'در انتظار',
  IR: 'در حال بررسی',
  AC: 'پذیرفته شده',
  RE: 'رد شده'
} as const;

/**
 * اینترفیس سفارش اشتراک (مطابق با بک‌اند SubscriptionOrder)
 */
export interface SubscriptionOrder {
  id: string;
  owner: string;
  advertisement: string;
  plan: string;
  subscription: string;
  payment_status: OrderStatus;
  ad_type: AdType;
  durations: number;
  price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

/**
 * پاسخ API برای ثبت آگهی (ساده‌شده)
 */
export interface JobCreationResponse {
  success: boolean;
  message: string;
  redirectUrl: string;
}

/**
 * آمار روزانه آگهی
 */
export interface JobDailyStats {
  job_id: string;
  date: string;
  views_count: number;
  applications_count: number;
  limit_reached: boolean;
}

/**
 * درخواست ایجاد سفارش آگهی جدید (فرآیند پرداخت-اول)
 */
export interface NewJobOrderRequest {
  plan_id: string;
  duration: string;
  // اطلاعات آگهی که موقتاً ذخیره می‌شود
  job_title: string;
  job_description?: string;
  company_id: string;
  industry_id: string;
  gender?: string;
  soldier_status?: string;
  degree?: string;
  salary?: string;
  job_type?: string;
}

/**
 * پاسخ ایجاد سفارش آگهی جدید
 */
export interface NewJobOrderResponse {
  Message: string;
  order_id: string;
  total_price: number;
  payment_url: string;
}

/**
 * درخواست ایجاد سفارش آگهی رزومه جدید (فرآیند پرداخت-اول)
 */
export interface NewResumeOrderRequest {
  plan_id: string;
  duration: string;
  // اطلاعات آگهی رزومه که موقتاً ذخیره می‌شود
  resume_title: string;
  resume_description?: string;
  city_id: string;
  industry_id: string;
  gender?: string;
  soldier_status?: string;
  degree?: string;
  salary?: string;
  job_type?: string;
}

/**
 * پاسخ ایجاد سفارش آگهی رزومه جدید
 */
export interface NewResumeOrderResponse {
  message: string;
  order_id: string;
  total_price: number;
  payment_url: string;
}

/**
 * پاسخ درخواست پرداخت از ZarinPal
 */
export interface PaymentRequestResponse {
  status: boolean;
  url?: string;
  authority?: string;
  message?: string;
  code?: string;
  errors?: string[];
}

/**
 * اینترفیس آگهی رزومه کارجو (مطابق با بک‌اند ResumeAdvertisement)
 */
export interface ResumeAdvertisement {
  id: string;
  job_seeker: string;
  resume: string;
  industry: string;
  advertisement: string;
  location: string;
  title: string;
  description?: string;
  status: 'P' | 'A' | 'R'; // P=در حال بررسی، A=تایید شده، R=رد شده
  gender?: 'M' | 'F' | 'N'; // M=مرد، F=زن، N=مهم نیست
  soldier_status?: 'CO' | 'EE' | 'NS'; // CO=پایان خدمت، EE=معافیت تحصیلی، NS=مهم نیست
  degree?: 'BD' | 'DI' | 'AS' | 'BA' | 'MA' | 'DO'; // BD=زیر دیپلم، DI=دیپلم، AS=فوق دیپلم، BA=لیسانس، MA=فوق لیسانس، DO=دکترا
  salary?: '5 to 10' | '10 to 15' | '15 to 20' | '20 to 30' | '30 to 50' | 'More than 50' | 'Negotiable';
  job_type?: 'FT' | 'PT' | 'RE' | 'IN'; // FT=تمام وقت، PT=پاره وقت، RE=دورکاری، IN=کارآموزی
  created_at: string;
  updated_at: string;
  
  // Related fields for detailed information
  job_seeker_detail?: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    user_type: string;
    username?: string;
  };
  location_detail?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };
  industry_detail?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
  advertisement_detail?: {
    id: string;
    ad_type: 'R';
    subscription: {
      id: string;
      subscription_status: 'default' | 'special';
      plan: any;
      duration: number;
      start_date: string;
      end_date: string;
    };
    created_at: string;
    updated_at: string;
  };
  subscription_detail?: {
    id: string;
    subscription_status: 'default' | 'special';
    plan: any;
    duration: number;
    start_date: string;
    end_date: string;
    created_at: string;
  };
  subscription_orders?: Array<{
    id: string;
    payment_status: string;
  }>;
} 