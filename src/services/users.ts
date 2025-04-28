import { api } from '@/lib/api';

/**
 * نوع داده کاربر
 */
export interface User {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    username: string;
    user_type: 'employer' | 'jobseeker' | 'admin';
    avatar?: string;
    bio?: string;
    skills?: string[];
    // سایر اطلاعات کاربر بر اساس API بک‌اند
}

/**
 * دریافت اطلاعات پروفایل کاربر فعلی
 */
export async function getMyProfile() {
    return api.get<User>('/profiles/me/', {
        showToast: false,
        revalidate: 3600
    });
}

/**
 * به‌روزرسانی پروفایل کاربر فعلی
 */
export async function updateMyProfile(userData: Partial<User>) {
    return api.put<User>('/profiles/me/', userData, {
        showToast: true
    });
}

/**
 * دریافت لیست کارجویان برتر
 */
export async function getTopJobSeekers(params?: {
    page?: number;
    limit?: number;
    skills?: string[];
}) {
    return api.get<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>('/profiles/jobseekers/top/', {
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
 * دریافت لیست کارفرمایان برتر
 */
export async function getTopEmployers(params?: {
    page?: number;
    limit?: number;
    industry?: string;
}) {
    return api.get<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>('/profiles/employers/top/', {
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
 * دریافت پروفایل کاربر با شناسه
 */
export async function getUserProfile(id: number | string) {
    return api.get<User>(`/profiles/${id}/`, {
        showToast: true,
        revalidate: 3600
    });
}

/**
 * دریافت لیست کاربران
 * @param params پارامترهای جستجو و فیلترینگ
 */
export async function getUsers(params?: {
    page?: number;
    limit?: number;
    query?: string;
    skills?: string[];
}) {
    return api.get<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>('/users', {
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
 * دریافت اطلاعات یک کاربر با شناسه
 * @param id شناسه کاربر
 */
export async function getUserById(id: number | string) {
    return api.get<User>(`/users/${id}`, {
        showToast: true,
        // کش داده به مدت 1 ساعت
        revalidate: 3600
    });
}

/**
 * ثبت کاربر جدید
 * @param userData اطلاعات کاربر
 */
export async function createUser(userData: Omit<User, 'id'>) {
    return api.post<User>('/users', userData, {
        showToast: true
    });
}

/**
 * ویرایش اطلاعات کاربر
 * @param id شناسه کاربر
 * @param userData اطلاعات جدید
 */
export async function updateUser(id: number | string, userData: Partial<User>) {
    return api.patch<User>(`/users/${id}`, userData, {
        showToast: true
    });
}

/**
 * حذف کاربر
 * @param id شناسه کاربر
 */
export async function deleteUser(id: number | string) {
    return api.delete<{ success: boolean }>(`/users/${id}`, {
        showToast: true
    });
} 