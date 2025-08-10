'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// تنظیمات NProgress
NProgress.configure({
    minimum: 0.1,
    easing: 'ease',
    speed: 400,
    showSpinner: false,
    trickleSpeed: 80,
});

export default function RealProgressProvider() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // شروع loading
        setIsLoading(true);
        NProgress.start();

        // شبیه‌سازی بارگذاری واقعی
        const loadingTimer = setTimeout(() => {
            // بررسی اینکه آیا صفحه واقعاً بارگذاری شده
            if (document.readyState === 'complete') {
                setIsLoading(false);
                NProgress.done();
            } else {
                // اگر هنوز بارگذاری نشده، منتظر بمان
                const checkComplete = () => {
                    if (document.readyState === 'complete') {
                        setIsLoading(false);
                        NProgress.done();
                    }
                };
                
                window.addEventListener('load', checkComplete);
                return () => window.removeEventListener('load', checkComplete);
            }
        }, 300);

        return () => {
            clearTimeout(loadingTimer);
            setIsLoading(false);
            NProgress.done();
        };
    }, [pathname, searchParams]);

    // گوش دادن به تغییرات DOM برای تشخیص بارگذاری واقعی
    useEffect(() => {
        const handleDOMChange = () => {
            if (document.readyState === 'complete' && isLoading) {
                setIsLoading(false);
                NProgress.done();
            }
        };

        document.addEventListener('readystatechange', handleDOMChange);
        
        return () => {
            document.removeEventListener('readystatechange', handleDOMChange);
        };
    }, [isLoading]);

    return null;
} 