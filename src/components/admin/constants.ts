// Common constants for admin components

// Page sizes for pagination
export const PAGE_SIZES = [10, 20, 50, 100];

// Default page size
export const DEFAULT_PAGE_SIZE = 10;

// Default sort field
export const DEFAULT_SORT_FIELD = 'joined_date';

// Default sort order
export const DEFAULT_SORT_ORDER = 'desc';

// User types
export const USER_TYPES = {
  JOB_SEEKER: 'JS',
  EMPLOYER: 'EM',
  ADMIN: 'AD',
  SUPPORT: 'SU'
} as const;

// User statuses
export const USER_STATUSES = {
  ACTIVE: 'ACT',
  SUSPENDED: 'SUS',
  DELETED: 'DEL'
} as const;

// Application statuses
export const APPLICATION_STATUSES = {
  PENDING: 'PE',
  IN_REVIEW: 'IR',
  ACCEPTED: 'AC',
  REJECTED: 'RE'
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

// Sort fields for different entities
export const SORT_FIELDS = {
  USERS: ['id', 'full_name', 'phone', 'user_type', 'status', 'joined_date', 'last_updated'],
  COMPANIES: ['id', 'name', 'created_at', 'is_active'],
  JOBS: ['id', 'title', 'status', 'created_at', 'company'],
  APPLICATIONS: ['id', 'created_at', 'status', 'job_seeker', 'advertisement'],
  PAYMENTS: ['id', 'amount', 'status', 'created_at', 'user'],
  SUBSCRIPTIONS: ['id', 'plan_name', 'status', 'start_date', 'end_date', 'price']
} as const;

// Table columns configuration
export const TABLE_COLUMNS = {
  USERS: [
    { field: 'full_name', label: 'نام کامل', width: '18%' },
    { field: 'phone', label: 'شماره تماس', width: '16%' },
    { field: 'user_type', label: 'نوع کاربر', width: '16%' },
    { field: 'status', label: 'وضعیت', width: '13%' },
    { field: 'joined_date', label: 'تاریخ عضویت', width: '17%' },
    { field: 'actions', label: 'عملیات', width: '12%' }
  ],
  COMPANIES: [
    { field: 'name', label: 'نام شرکت', width: '25%' },
    { field: 'industry', label: 'گروه کاری', width: '20%' },
    { field: 'location', label: 'موقعیت', width: '20%' },
    { field: 'created_at', label: 'تاریخ ایجاد', width: '15%' },
    { field: 'actions', label: 'عملیات', width: '10%' }
  ],
  JOBS: [
    { field: 'title', label: 'عنوان آگهی', width: '30%' },
    { field: 'company', label: 'شرکت', width: '20%' },
    { field: 'status', label: 'وضعیت', width: '15%' },
    { field: 'created_at', label: 'تاریخ ایجاد', width: '15%' },
    { field: 'actions', label: 'عملیات', width: '10%' }
  ]
} as const;

// Search placeholders
export const SEARCH_PLACEHOLDERS = {
  USERS: 'جستجو در نام، شماره تماس...',
  COMPANIES: 'جستجو در نام شرکت، گروه کاری...',
  JOBS: 'جستجو در عنوان آگهی، شرکت...',
  APPLICATIONS: 'جستجو در نام کارجو، عنوان آگهی...',
  PAYMENTS: 'جستجو در نام کاربر، شماره تراکنش...',
  SUBSCRIPTIONS: 'جستجو در نام کاربر، نام پلن...'
} as const;

// Filter options
export const FILTER_OPTIONS = {
  USER_TYPE: [
    { value: '', label: 'همه انواع' },
    { value: 'JS', label: 'کارجو' },
    { value: 'EM', label: 'کارفرما' },
    { value: 'AD', label: 'مدیریت' },
    { value: 'SU', label: 'پشتیبان' }
  ],
  USER_STATUS: [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'ACT', label: 'فعال' },
    { value: 'SUS', label: 'تعلیق شده' },
    { value: 'DEL', label: 'حذف شده' }
  ],
  APPLICATION_STATUS: [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'PE', label: 'در انتظار بررسی' },
    { value: 'IR', label: 'در حال بررسی' },
    { value: 'AC', label: 'تایید شده' },
    { value: 'RE', label: 'رد شده' }
  ],
  PAYMENT_STATUS: [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'PENDING', label: 'در انتظار' },
    { value: 'COMPLETED', label: 'تکمیل شده' },
    { value: 'FAILED', label: 'ناموفق' },
    { value: 'CANCELLED', label: 'لغو شده' }
  ]
} as const; 