// Common utility functions for admin components

// تابع تبدیل تاریخ میلادی به شمسی
export const convertToJalali = (gregorianDate: string): string => {
  try {
    const date = new Date(gregorianDate);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('خطا در تبدیل تاریخ:', error);
    return gregorianDate || 'نامشخص';
  }
};

// تابع تبدیل اعداد به فارسی
export const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

// تابع دریافت نام فارسی نوع کاربر
export const getUserTypeLabel = (type: string) => {
  const types = {
    'JS': 'کارجو',
    'EM': 'کارفرما',
    'AD': 'مدیریت',
    'SU': 'پشتیبان'
  };
  return types[type as keyof typeof types] || type;
};

// تابع دریافت رنگ نوع کاربر
export const getUserTypeColor = (type: string) => {
  const colors = {
    'JS': 'success',
    'EM': 'primary',
    'AD': 'error',
    'SU': 'warning'
  };
  return colors[type as keyof typeof colors] || 'default';
};

// تابع دریافت نام فارسی فیلدهای مرتب‌سازی
export const getSortFieldLabel = (field: string) => {
  const labels = {
    'id': 'شناسه',
    'full_name': 'نام کامل',
    'phone': 'شماره تماس',
    'user_type': 'نوع کاربر',
    'status': 'وضعیت',
    'joined_date': 'تاریخ عضویت',
    'last_updated': 'آخرین به‌روزرسانی',
    'created_at': 'تاریخ ایجاد',
    'title': 'عنوان',
    'name': 'نام',
    'amount': 'مبلغ',
    'price': 'قیمت'
  };
  return labels[field as keyof typeof labels] || field;
};

// تابع دریافت نام فارسی وضعیت درخواست
export const getApplicationStatusLabel = (status: string) => {
  const labels = {
    'PE': 'در انتظار بررسی',
    'IR': 'در حال بررسی',
    'AC': 'تایید شده',
    'RE': 'رد شده'
  };
  return labels[status as keyof typeof labels] || status;
};

// تابع دریافت رنگ وضعیت درخواست
export const getApplicationStatusColor = (status: string) => {
  const colors = {
    'PE': 'warning',
    'IR': 'info',
    'AC': 'success',
    'RE': 'error'
  };
  return colors[status as keyof typeof colors] || 'default';
};

// تابع دریافت نام فارسی وضعیت پرداخت
export const getPaymentStatusLabel = (status: string) => {
  const labels = {
    'PENDING': 'در انتظار',
    'COMPLETED': 'تکمیل شده',
    'FAILED': 'ناموفق',
    'CANCELLED': 'لغو شده'
  };
  return labels[status as keyof typeof labels] || status;
};

// تابع دریافت رنگ وضعیت پرداخت
export const getPaymentStatusColor = (status: string) => {
  const colors = {
    'PENDING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'error',
    'CANCELLED': 'default'
  };
  return colors[status as keyof typeof colors] || 'default';
};

// تابع فرمت کردن مبلغ
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

// تابع فرمت کردن قیمت
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

// تابع تعیین وضعیت کاربر
export const getUserStatus = (user: any): { isActive: boolean; label: string } => {
  if (user.status) {
    return {
      isActive: user.status === 'ACT',
      label: user.status === 'ACT' ? 'فعال' :
        user.status === 'SUS' ? 'تعلیق شده' :
          user.status === 'DEL' ? 'حذف شده' : 'نامشخص'
    };
  }

  return {
    isActive: user.is_active,
    label: user.is_active ? 'فعال' : 'غیرفعال'
  };
}; 