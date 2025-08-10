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
                
                // اگر فراخوانی قبلی هنوز در حال اجراست، از اجرای مجدد خودداری می‌کنیم
                if (isUserDataFetchInProgress) {
                    console.log('[AuthStore] فراخوانی قبلی هنوز در حال اجراست، از اجرای مجدد خودداری می‌شود');
                    return;
                }
                
                // اگر کمتر از 2 ثانیه از آخرین فراخوانی گذشته باشد، از اجرای مجدد خودداری می‌کنیم
                const now = Date.now();
                const lastFetch = typeof window !== 'undefined' ? (window as any)._lastUserDataFetch || 0 : 0;
                if (now - lastFetch < 2000) {
                    console.log('[AuthStore] فاصله زمانی تا فراخوانی قبلی کمتر از حد مجاز است، از اجرای مجدد خودداری می‌شود');
                    return;
                }
                
                // شروع فراخوانی
                isUserDataFetchInProgress = true;
                if (typeof window !== 'undefined') {
                    (window as any)._lastUserDataFetch = now;
                }
                
                try {
                    set({ loading: true });
                    
                    // بررسی توکن‌ها از طریق کوکی بدون نیاز به خواندن اطلاعات کاربر از کوکی
                    const accessToken = cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
                    const refreshToken = cookieService.getCookie(COOKIE_NAMES.REFRESH_TOKEN);
                    
                    if (!accessToken && !refreshToken) {
                        set({ user: null, isAuthenticated: false });
                        return;
                    }
                    
                    // بررسی اعتبار توکن فعلی و رفرش در صورت نیاز
                    await authService.validateAndRefreshTokenIfNeeded();
                    
                    // دریافت اطلاعات کاربر با استفاده از سرویس احراز هویت
                    const userData = await authService.getUserData();
                    
                    if (userData) {
                        set({ user: userData, isAuthenticated: true });
                    } else {
                        set({ user: null, isAuthenticated: false });
                        
                        // پاک کردن کوکی‌های احتمالی قدیمی
                        authService.logout();
                    }
                } catch (error) {
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
                    if (typeof window !== 'undefined') {
                        (window as any)._lastUserDataFetch = Date.now();
                    }

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
                        if (typeof window !== 'undefined') {
                            (window as any)._lastUserDataFetch = Date.now();
                        }
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
                
                // اگر فراخوانی قبلی هنوز در حال اجراست، از اجرای مجدد خودداری می‌کنیم
                if (isUserDataFetchInProgress) {
                    console.log('[AuthStore] فراخوانی قبلی هنوز در حال اجراست، از اجرای مجدد خودداری می‌شود');
                    return;
                }
                
                // اگر کمتر از 1 ثانیه از آخرین فراخوانی گذشته باشد، از اجرای مجدد خودداری می‌کنیم
                // برای refreshUserData زمان کمتری در نظر می‌گیریم چون ممکن است به صورت مستقیم فراخوانی شود
                const now = Date.now();
                const lastFetch = typeof window !== 'undefined' ? (window as any)._lastUserDataFetch || 0 : 0;
                if (now - lastFetch < 1000) {
                    console.log('[AuthStore] فاصله زمانی تا فراخوانی قبلی کمتر از حد مجاز است، از اجرای مجدد خودداری می‌شود');
                    return;
                }
                
                // شروع فراخوانی
                isUserDataFetchInProgress = true;
                if (typeof window !== 'undefined') {
                    (window as any)._lastUserDataFetch = now;
                }
                
                try {
                    set({ loading: true });
                    
                    // بررسی اعتبار توکن فعلی و رفرش در صورت نیاز
                    const isValid = await authService.validateAndRefreshTokenIfNeeded();
                    
                    if (!isValid) {
                        set({ user: null, isAuthenticated: false });
                        authService.logout();
                        return;
                    }
                    
                    // دریافت اطلاعات کاربر با استفاده از سرویس احراز هویت
                    const userData = await authService.getUserData();
                    
                    if (userData) {
                        set({ user: userData, isAuthenticated: true });
                    } else {
                        set({ user: null, isAuthenticated: false });
                        authService.logout();
                    }
                } catch (error) {
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
