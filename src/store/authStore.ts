import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, {
    UserData,
    LoginCredentials,
    RegisterData,
    TokenResponse,
    RegisterValidateResponse
} from '../lib/authService';
import cookieService, { COOKIE_NAMES } from '../lib/cookieService';
import { toast } from 'react-hot-toast';

interface AuthState {
    // State ها
    isAuthenticated: boolean;
    user: UserData | null;
    loading: boolean;
    loginError: string | null;
    registerError: string | null;
    verifyError: string | null;
    
    // Actions (توابعی که state را تغییر می‌دهند)
    setUser: (user: UserData | null) => void;
    setIsAuthenticated: (status: boolean) => void;
    setLoading: (status: boolean) => void;
    clearErrors: () => void;
    setLoginError: (error: string | null) => void;
    setRegisterError: (error: string | null) => void;
    setVerifyError: (error: string | null) => void;
    
    // Thunks (عملیات ناهمگام که با API تعامل دارند)
    loginOtp: (phone: string) => Promise<string>;
    validateLoginOtp: (token: string, code: string) => Promise<UserData>;
    logout: () => void;
    registerOtp: (userData: RegisterData) => Promise<string>;
    validateOtp: (token: string, code: string) => Promise<RegisterValidateResponse>;
    checkPhoneExists: (phone: string) => Promise<boolean>;
    updateUserType: (user_type: string) => Promise<UserData>;
    refreshUserData: () => Promise<void>;
    fetchUserData: () => Promise<void>;
}

// متغیر نشانگر در حال اجرا بودن فراخوانی‌ها
let isUserDataFetchInProgress = false;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // State های اولیه
            isAuthenticated: false,
            user: null,
            loading: false,
            loginError: null,
            registerError: null,
            verifyError: null,
            
            // Actions
            setUser: (user) => set({ user }),
            setIsAuthenticated: (status) => set({ isAuthenticated: status }),
            setLoading: (status) => set({ loading: status }),
            clearErrors: () => set({ loginError: null, registerError: null, verifyError: null }),
            setLoginError: (error) => set({ loginError: error }),
            setRegisterError: (error) => set({ registerError: error }),
            setVerifyError: (error) => set({ verifyError: error }),
            
            // Thunks
            fetchUserData: async () => {
                // بررسی وضعیت قبل از شروع به کار برای جلوگیری از حلقه‌های بی‌نهایت
                const state = get();
                
                // اگر در حال بارگذاری هستیم یا فراخوانی دیگری در حال اجراست، درخواست جدیدی انجام ندهیم
                if (state.loading || isUserDataFetchInProgress) {
                    console.log('[AuthStore] درخواست fetchUserData رد شد - در حال بارگذاری یا فراخوانی دیگری در جریان است');
                    return;
                }
                
                // اضافه کردن throttling بر اساس زمان آخرین فراخوانی
                const now = Date.now();
                const lastFetch = (window as any)._lastUserDataFetch || 0;
                
                // اگر کمتر از 2 ثانیه از آخرین فراخوانی گذشته، از فراخوانی جدید جلوگیری کنیم
                if (now - lastFetch < 2000) {
                    console.log('[AuthStore] فراخوانی fetchUserData مکرر محدود شد');
                    return;
                }
                
                // ثبت زمان فراخوانی فعلی
                (window as any)._lastUserDataFetch = now;
                
                // علامت‌گذاری شروع فراخوانی
                isUserDataFetchInProgress = true;
                
                try {
                    set({ loading: true });
                    
                    // بررسی توکن‌ها از طریق کوکی بدون نیاز به خواندن اطلاعات کاربر از کوکی
                    const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
                    const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);
                    
                    if (!accessToken && !refreshToken) {
                        console.log('[AuthStore] توکن‌های دسترسی و بازیابی موجود نیست، کاربر احراز هویت نشده است');
                        set({ user: null, isAuthenticated: false });
                        return;
                    }
                    
                    // بررسی اعتبار توکن فعلی و رفرش در صورت نیاز
                    await authService.validateAndRefreshTokenIfNeeded();
                    
                    // دریافت اطلاعات کاربر با استفاده از سرویس احراز هویت
                    const userData = await authService.getUserData();
                    
                    if (userData) {
                        console.log('[AuthStore] اطلاعات کاربر دریافت شد:', {
                            userType: userData.user_type,
                            isEmployer: userData.user_type === 'employer' || userData.user_type === 'EM'
                        });
                        
                        set({ user: userData, isAuthenticated: true });
                    } else {
                        console.log('[AuthStore] اطلاعات کاربر دریافت نشد، کاربر احراز هویت نشده است');
                        set({ user: null, isAuthenticated: false });
                        
                        // پاک کردن کوکی‌های احتمالی قدیمی
                        authService.logout();
                    }
                } catch (error) {
                    console.error('[AuthStore] خطا در دریافت اطلاعات کاربر:', error);
                    set({ user: null, isAuthenticated: false });
                    
                    // در صورت خطا، کوکی‌ها را پاک می‌کنیم
                    authService.logout();
                } finally {
                    set({ loading: false });
                    // اتمام فراخوانی
                    isUserDataFetchInProgress = false;
                }
            },
            
            loginOtp: async (phone) => {
                get().clearErrors();
                set({ loading: true });
                try {
                    const token = await authService.loginOtp(phone);
                    return token;
                } catch (error: any) {
                    console.error('خطا در درخواست OTP ورود:', error.message);
                    set({ loginError: error.message || 'خطا در درخواست کد تایید ورود' });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },
            
            validateLoginOtp: async (token, code) => {
                get().clearErrors();
                set({ loading: true });
                try {
                    // دریافت اطلاعات کاربر از طریق تایید OTP
                    const userData = await authService.validateLoginOtp(token, code);

                    // تنظیم اطلاعات کاربر در state
                    set({ user: userData, isAuthenticated: true });

                    // ثبت زمان فراخوانی فعلی برای throttling
                    (window as any)._lastUserDataFetch = Date.now();

                    toast.success('ورود با موفقیت انجام شد');
                    return userData;
                } catch (error: any) {
                    console.error('[AuthStore] خطا در تایید کد OTP برای ورود:', error.message);
                    
                    // بررسی خطاهای شبکه و HTTP مختلف
                    if (error.response) {
                        if (error.response.status === 400) {
                            set({ loginError: 'کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.' });
                            throw new Error('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.');
                        } else if (error.response.status === 401) {
                            set({ loginError: 'کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید.' });
                            throw new Error('کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید.');
                        } else if (error.response.status === 404) {
                            set({ loginError: 'درخواست نامعتبر است. لطفاً دوباره تلاش کنید.' });
                            throw new Error('درخواست نامعتبر است. لطفاً دوباره تلاش کنید.');
                        }
                    }
                    
                    set({ loginError: error.message || 'کد تایید نامعتبر است' });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },
            
            registerOtp: async (userData) => {
                get().clearErrors();
                set({ loading: true });
                try {
                    const token = await authService.registerOtp(userData);
                    return token;
                } catch (error: any) {
                    console.error('خطا در فرآیند ثبت‌نام:', error.message);
                    set({ registerError: error.message || 'خطا در ارسال کد تایید' });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },
            
            validateOtp: async (token, code) => {
                get().clearErrors();
                set({ loading: true });
                try {
                    // دریافت پاسخ تایید کد OTP برای ثبت‌نام
                    const response = await authService.validateOtp(token, code);

                    // اگر اطلاعات کاربر در پاسخ وجود داشت، آن را ذخیره می‌کنیم
                    if (response.Detail && response.Detail.User) {
                        set({ 
                            user: response.Detail.User, 
                            isAuthenticated: true 
                        });
                        
                        // ثبت زمان فراخوانی فعلی برای throttling
                        (window as any)._lastUserDataFetch = Date.now();
                    }

                    return response;
                } catch (error: any) {
                    console.error('[AuthStore] خطا در تایید کد OTP برای ثبت‌نام:', error.message);
                    
                    // بررسی خطاهای شبکه و HTTP مختلف
                    if (error.response) {
                        if (error.response.status === 400) {
                            set({ verifyError: 'کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.' });
                            throw new Error('کد تایید نامعتبر است. لطفاً کد صحیح را وارد کنید.');
                        } else if (error.response.status === 401) {
                            set({ verifyError: 'کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید.' });
                            throw new Error('کد تایید منقضی شده است. لطفاً دوباره درخواست کد کنید.');
                        } else if (error.response.status === 404) {
                            set({ verifyError: 'درخواست نامعتبر است. لطفاً دوباره تلاش کنید.' });
                            throw new Error('درخواست نامعتبر است. لطفاً دوباره تلاش کنید.');
                        }
                    }
                    
                    // استفاده از پیام خطای دقیق از سرویس
                    const errorMessage = error.message || 'کد تایید نامعتبر است';
                    set({ verifyError: errorMessage });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },
            
            logout: () => {
                authService.logout();
                set({ isAuthenticated: false, user: null });
            },
            
            checkPhoneExists: async (phone) => {
                try {
                    return await authService.checkPhoneExists(phone);
                } catch (error: any) {
                    toast.error(error.message || 'خطا در بررسی شماره تلفن');
                    throw error;
                }
            },
            
            updateUserType: async (user_type) => {
                try {
                    const updatedUser = await authService.updateUserType(user_type);
                    
                    // به‌روزرسانی حالت کاربر در store
                    set((state) => ({
                        user: state.user ? { ...state.user, user_type } : null
                    }));
                    
                    return updatedUser;
                } catch (error: any) {
                    toast.error(error.message || 'خطا در بروزرسانی نوع کاربر');
                    throw error;
                }
            },
            
            refreshUserData: async () => {
                // بررسی وضعیت قبل از شروع به کار
                const state = get();
                
                // اگر در حال بارگذاری هستیم یا کاربر احراز هویت نشده یا فراخوانی دیگری در حال اجراست، فراخوانی نکنیم
                if (state.loading || !state.isAuthenticated || isUserDataFetchInProgress) {
                    console.log('[AuthStore] رد درخواست refreshUserData - loading یا عدم احراز هویت یا فراخوانی دیگری در جریان است');
                    return;
                }
                
                // استفاده از timestamp برای محدود کردن فراخوانی‌های مکرر
                const now = Date.now();
                const lastFetch = (window as any)._lastUserDataFetch || 0;
                
                // حداقل 5 ثانیه بین درخواست‌ها فاصله باشد
                if (now - lastFetch < 5000) {
                    console.log('[AuthStore] فراخوانی refreshUserData محدود شد - زمان کافی از درخواست قبلی نگذشته است');
                    return;
                }
                
                // ثبت زمان فراخوانی فعلی
                (window as any)._lastUserDataFetch = now;
                
                // علامت‌گذاری شروع فراخوانی
                isUserDataFetchInProgress = true;
                
                try {
                    set({ loading: true });
                    
                    // بررسی اعتبار توکن فعلی و رفرش در صورت نیاز
                    const isValid = await authService.validateAndRefreshTokenIfNeeded();
                    
                    if (!isValid) {
                        console.log('[AuthStore] توکن نامعتبر است و رفرش ناموفق بود، خروج از سیستم');
                        set({ user: null, isAuthenticated: false });
                        authService.logout();
                        return;
                    }
                    
                    // دریافت اطلاعات کاربر با استفاده از سرویس احراز هویت
                    const userData = await authService.getUserData();
                    
                    if (userData) {
                        console.log('[AuthStore] اطلاعات کاربر با موفقیت به‌روزرسانی شد');
                        set({ user: userData, isAuthenticated: true });
                    } else {
                        console.log('[AuthStore] اطلاعات کاربر دریافت نشد، کاربر احراز هویت نشده است');
                        set({ user: null, isAuthenticated: false });
                        authService.logout();
                    }
                } catch (error) {
                    console.error('[AuthStore] خطا در به‌روزرسانی اطلاعات کاربر:', error);
                    set({ user: null, isAuthenticated: false });
                    authService.logout();
                } finally {
                    set({ loading: false });
                    // اتمام فراخوانی
                    isUserDataFetchInProgress = false;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ 
                // فقط برخی از state ها را در localStorage ذخیره می‌کنیم
                // توکن‌ها در کوکی‌ها ذخیره می‌شوند، بنابراین نیازی به ذخیره‌سازی آنها در اینجا نیست
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

// هوک‌های کاربردی برای دسترسی به state ها و action ها به صورت جداگانه
export const useAuth = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    return { isAuthenticated, user };
};

export const useAuthActions = () => {
    return {
        loginOtp: useAuthStore((state) => state.loginOtp),
        validateLoginOtp: useAuthStore((state) => state.validateLoginOtp),
        logout: useAuthStore((state) => state.logout),
        registerOtp: useAuthStore((state) => state.registerOtp),
        validateOtp: useAuthStore((state) => state.validateOtp),
        checkPhoneExists: useAuthStore((state) => state.checkPhoneExists),
        updateUserType: useAuthStore((state) => state.updateUserType),
        refreshUserData: useAuthStore((state) => state.refreshUserData)
    };
};

export const useAuthStatus = () => {
    return {
        loading: useAuthStore((state) => state.loading),
        loginError: useAuthStore((state) => state.loginError),
        registerError: useAuthStore((state) => state.registerError),
        verifyError: useAuthStore((state) => state.verifyError)
    };
};