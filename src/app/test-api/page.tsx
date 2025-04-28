'use client';

import { useState, useEffect } from 'react';
import { getJobCategories } from '@/services/jobs';
import { api } from '@/lib/api';

export default function TestAPIPage() {
    const [status, setStatus] = useState<string>('در حال بررسی اتصال...');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState<string>('');

    useEffect(() => {
        setApiUrl(process.env.NEXT_PUBLIC_API_URL || '');

        async function testConnection() {
            try {
                // تست یک API ساده که احتمالاً نیاز به احراز هویت ندارد
                const response = await api.get('/industries/', {
                    withAuth: false,
                    showToast: false,
                });

                setStatus('اتصال با موفقیت برقرار شد!');
                setResult(response);
                setError(null);
            } catch (err: any) {
                setStatus('خطا در اتصال به بک‌اند');
                setError(err.message || 'خطای ناشناخته');
                setResult(null);
            }
        }

        testConnection();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">تست اتصال به بک‌اند</h1>

            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <p className="mb-2"><strong>آدرس API:</strong> {apiUrl}</p>
                <p className="mb-2"><strong>وضعیت:</strong>
                    <span className={`ml-2 ${status.includes('موفقیت')
                            ? 'text-green-600'
                            : status.includes('خطا')
                                ? 'text-red-600'
                                : 'text-blue-600'
                        }`}>
                        {status}
                    </span>
                </p>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                        <p className="font-bold">پیام خطا:</p>
                        <p className="mt-1">{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-3">نتیجه درخواست:</h2>
                    <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded p-4">
                <h2 className="text-lg font-semibold mb-2">راهنمای عیب‌یابی:</h2>
                <ul className="list-disc list-inside text-sm space-y-2">
                    <li>اطمینان حاصل کنید که سرور بک‌اند در آدرس <code className="bg-gray-100 px-1 py-0.5 rounded">localhost:8000</code> در حال اجراست.</li>
                    <li>مطمئن شوید که CORS در بک‌اند فعال شده و به درخواست‌های از <code className="bg-gray-100 px-1 py-0.5 rounded">localhost:3000</code> اجازه دسترسی می‌دهد.</li>
                    <li>اگر با خطای CORS مواجه هستید، از افزونه‌های مرورگر برای غیرفعال کردن موقت CORS برای تست استفاده کنید.</li>
                    <li>بررسی کنید که مسیرهای API در فایل‌های سرویس مطابق با مسیرهای واقعی بک‌اند باشند.</li>
                </ul>
            </div>
        </div>
    );
} 