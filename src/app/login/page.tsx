'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { login, isLoading, error } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!phone) {
            setFormError('لطفاً شماره تلفن خود را وارد کنید');
            return;
        }

        if (!password) {
            setFormError('لطفاً رمز عبور خود را وارد کنید');
            return;
        }

        try {
            const success = await login(phone, password);
            if (success) {
                // هدایت کاربر به صفحه مورد نظر
                router.push(redirect);
            } else {
                setFormError('ورود به سیستم با خطا مواجه شد');
            }
        } catch (err: any) {
            setFormError(err.message || 'خطا در ورود به سیستم');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">ورود به حساب کاربری</h1>

                {(formError || error) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                        {formError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-gray-700 mb-2">
                            شماره تلفن
                        </label>
                        <input
                            type="text"
                            id="phone"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isLoading}
                            dir="ltr"
                            placeholder="09xxxxxxxxx"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            رمز عبور
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'درحال ورود...' : 'ورود'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link href="/register" className="text-primary-600 hover:text-primary-700">
                        حساب کاربری ندارید؟ ثبت‌نام کنید
                    </Link>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/forgot-password" className="text-gray-600 hover:text-gray-800 text-sm">
                        رمز عبور خود را فراموش کرده‌اید؟
                    </Link>
                </div>
            </div>
        </div>
    );
} 