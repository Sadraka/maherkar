// توابع مشترک برای تبدیل اطلاعات آگهی‌های شغلی

export const getJobTypeText = (jobType?: string) => {
  const typeMap: Record<string, string> = {
    // مقادیر کوتاه (آگهی رزومه)
    'FT': 'تمام وقت',
    'PT': 'پاره وقت',
    'RE': 'دورکاری',
    'IN': 'کارآموزی',
    // مقادیر طولانی (رزومه)
    'Full-Time': 'تمام وقت',
    'Part-Time': 'پاره وقت',
    'Remote': 'دورکاری',
    'Internship': 'کارآموزی'
  };
  return jobType ? typeMap[jobType] || jobType : 'نامشخص';
};

export const getSalaryText = (salary?: string) => {
  // تبدیل اعداد انگلیسی به فارسی
  const toPersianDigits = (value: string): string =>
    value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

  if (!salary) return 'توافقی';
  
  // اگر مقدار شامل اعداد انگلیسی است، آن را تبدیل کن
  if (/\d/.test(salary)) {
    // پردازش مقادیر مختلف که ممکن است از بک‌اند بیاید
    if (salary.includes('5') && salary.includes('10')) {
      return '۵ تا ۱۰ میلیون تومان';
    }
    if (salary.includes('10') && salary.includes('15')) {
      return '۱۰ تا ۱۵ میلیون تومان';
    }
    if (salary.includes('15') && salary.includes('20')) {
      return '۱۵ تا ۲۰ میلیون تومان';
    }
    if (salary.includes('20') && salary.includes('30')) {
      return '۲۰ تا ۳۰ میلیون تومان';
    }
    if (salary.includes('30') && salary.includes('50')) {
      return '۳۰ تا ۵۰ میلیون تومان';
    }
    if (salary.includes('50')) {
      return 'بیش از ۵۰ میلیون تومان';
    }
    
    // اگر فرمت جدیدی بود، اعداد را فارسی کن
    return toPersianDigits(salary.replace(/to/g, 'تا').replace(/more than/gi, 'بیش از')) + ' میلیون تومان';
  }

  // case های استاندارد
  switch (salary) {
    case '5 to 10': return '۵ تا ۱۰ میلیون تومان';
    case '10 to 15': return '۱۰ تا ۱۵ میلیون تومان';
    case '15 to 20': return '۱۵ تا ۲۰ میلیون تومان';
    case '20 to 30': return '۲۰ تا ۳۰ میلیون تومان';
    case '30 to 50': return '۳۰ تا ۵۰ میلیون تومان';
    case 'More than 50': return 'بیش از ۵۰ میلیون تومان';
    case 'Negotiable': return 'توافقی';
    default: 
      // اگر هیچ case ای مطابقت نکرد، مقدار اصلی را با اعداد فارسی برگردان
      return toPersianDigits(salary);
  }
};

export const getDegreeText = (degree?: string) => {
  const degreeMap: Record<string, string> = {
    // مقادیر کوتاه (آگهی رزومه)
    'BD': 'زیر دیپلم',
    'DI': 'دیپلم',
    'AS': 'فوق دیپلم',
    'BA': 'لیسانس',
    'MA': 'فوق لیسانس',
    'DO': 'دکترا',
    // مقادیر طولانی (رزومه)
    'Below Diploma': 'زیر دیپلم',
    'Diploma': 'دیپلم',
    'Associate': 'فوق دیپلم',
    'Bachelor': 'لیسانس',
    'Master': 'فوق لیسانس',
    'Doctorate': 'دکترا'
  };
  return degree ? degreeMap[degree] || degree : 'نامشخص';
};

export const getGenderText = (gender?: string) => {
  const genderMap: Record<string, string> = {
    // مقادیر کوتاه (آگهی رزومه)
    'M': 'آقا',
    'F': 'خانم',
    'N': 'مهم نیست',
    // مقادیر طولانی (رزومه)
    'Male': 'آقا',
    'Female': 'خانم'
  };
  return gender ? genderMap[gender] || gender : 'نامشخص';
};

export const getSoldierStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    // مقادیر کوتاه (آگهی رزومه)
    'CO': 'پایان خدمت',
    'EE': 'معافیت تحصیلی',
    'NS': 'مهم نیست',
    // مقادیر طولانی (رزومه)
    'Completed': 'پایان خدمت',
    'Permanent Exemption': 'معافیت دائم',
    'Educational Exemption': 'معافیت تحصیلی',
    'Not Completed': 'نااتمام'
  };
  return status ? statusMap[status] || status : 'نامشخص';
};

export const getStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    'P': 'در انتظار بررسی',
    'A': 'تایید شده',
    'R': 'رد شده',
    'Approved': 'تایید شده',
    'Rejected': 'رد شده',
    'ACTIVE': 'فعال'
  };
  return statuses[status] || status;
};

export const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
  const colors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
    'P': 'warning',
    'A': 'success',
    'R': 'error',
    'Approved': 'success',
    'Rejected': 'error',
    'ACTIVE': 'success'
  };
  return colors[status] || 'default';
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch {
    return 'تاریخ نامعلوم';
  }
};

export const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
}; 