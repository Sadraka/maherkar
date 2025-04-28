import { api } from '@/lib/api';

/**
 * نوع داده آگهی شغلی
 */
export interface Job {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    salary: {
        min: number;
        max: number;
        currency: string;
    };
    company: {
        id: number;
        name: string;
        logo?: string;
    };
    isRemote: boolean;
    isUrgent: boolean;
    isPromoted: boolean;
    skills: string[];
    createdAt: string;
    expiresAt: string;
    // سایر اطلاعات آگهی شغلی
}

/**
 * پارامترهای جستجوی آگهی شغلی
 */
export interface JobSearchParams {
    page?: number;
    limit?: number;
    query?: string;
    category?: string;
    location?: string;
    isRemote?: boolean;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    sort?: 'latest' | 'popular' | 'salary';
}

/**
 * دریافت لیست آگهی‌های شغلی
 */
export async function getJobs(params?: JobSearchParams) {
    return api.get<{
        data: Job[];
        total: number;
        page: number;
        limit: number;
    }>('/ads/job/', {
        showToast: false,
        // انتقال پارامترهای URL
        ...params && {
            search: new URLSearchParams(
                Object.entries(params)
                    .filter(([_, value]) => value !== undefined)
                    .flatMap(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(v => [key, v]);
                        }
                        return [[key, value.toString()]];
                    })
            ).toString()
        }
    });
}

/**
 * دریافت اطلاعات یک آگهی شغلی با شناسه
 */
export async function getJobById(id: number | string) {
    return api.get<Job>(`/ads/job/${id}/`, {
        showToast: true,
        // کش داده به مدت 30 دقیقه
        revalidate: 1800
    });
}

/**
 * ثبت آگهی شغلی جدید
 */
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'company'>) {
    return api.post<Job>('/ads/job/', jobData, {
        showToast: true
    });
}

/**
 * ویرایش آگهی شغلی
 */
export async function updateJob(id: number | string, jobData: Partial<Job>) {
    return api.patch<Job>(`/ads/job/${id}/`, jobData, {
        showToast: true
    });
}

/**
 * حذف آگهی شغلی
 */
export async function deleteJob(id: number | string) {
    return api.delete<{ success: boolean }>(`/ads/job/${id}/`, {
        showToast: true
    });
}

/**
 * دریافت دسته‌بندی‌های شغلی
 */
export async function getJobCategories() {
    return api.get<string[]>('/industries/', {
        showToast: false,
        // کش داده به مدت 24 ساعت
        revalidate: 86400
    });
}

/**
 * دریافت لیست آگهی‌های درخواست کار (رزومه)
 */
export async function getResumeAds(params?: JobSearchParams) {
    return api.get<{
        data: Job[];
        total: number;
        page: number;
        limit: number;
    }>('/ads/resume/', {
        showToast: false,
        // انتقال پارامترهای URL
        ...params && {
            search: new URLSearchParams(
                Object.entries(params)
                    .filter(([_, value]) => value !== undefined)
                    .flatMap(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(v => [key, v]);
                        }
                        return [[key, value.toString()]];
                    })
            ).toString()
        }
    });
}

/**
 * ثبت آگهی درخواست کار (رزومه)
 */
export async function createResumeAd(resumeData: any) {
    return api.post<Job>('/ads/resume/', resumeData, {
        showToast: true
    });
} 