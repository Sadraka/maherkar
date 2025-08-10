import { create } from 'zustand';
import { apiGet } from '@/lib/axios';

interface JobStats {
  totalJobs: number;
  pendingJobs: number;
}

interface JobStatsStore {
  jobStats: JobStats;
  jobStatsLoading: boolean;
  lastFetch: number;
  fetchJobStats: () => Promise<void>;
  refreshJobStats: () => Promise<void>;
  startAutoRefresh: () => NodeJS.Timeout;
  stopAutoRefresh: (interval: NodeJS.Timeout) => void;
}

export const useJobStatsStore = create<JobStatsStore>((set, get) => ({
  jobStats: { totalJobs: 0, pendingJobs: 0 },
  jobStatsLoading: true,
  lastFetch: 0,

  fetchJobStats: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;
    
    // اگر کمتر از 30 ثانیه از آخرین fetch گذشته، آپدیت نکن (بهینه برای اینترنت ضعیف)
    if (now - lastFetch < 30000) {
      return;
    }

    try {
      set({ jobStatsLoading: true });
      
      // استفاده از API مخصوص آمار
      const statsResponse = await apiGet('/ads/job/stats/');
      
      const newStats = {
        totalJobs: (statsResponse.data as any)?.totalJobs || 0,
        pendingJobs: (statsResponse.data as any)?.pendingJobs || 0
      };
      
      set({
        jobStats: newStats,
        jobStatsLoading: false,
        lastFetch: now
      });
    } catch (error) {
      console.error('خطا در دریافت آمار آگهی‌ها:', error);
      set({ jobStatsLoading: false });
    }
  },

  refreshJobStats: async () => {
    // برای refresh، throttling را نادیده بگیر
    const now = Date.now();
    set({ lastFetch: now - 31000 }); // Force refresh
    await get().fetchJobStats();
  },

  // شروع آپدیت خودکار - بهینه برای اینترنت ضعیف
  startAutoRefresh: () => {
    const interval = setInterval(() => {
      get().fetchJobStats();
    }, 300000); // هر 5 دقیقه (بهینه برای اینترنت ضعیف)
    return interval;
  },

  // توقف آپدیت خودکار
  stopAutoRefresh: (interval: NodeJS.Timeout) => {
    clearInterval(interval);
  }
}));

// برای debug
if (typeof window !== 'undefined') {
  (window as any).jobStatsStore = useJobStatsStore;
} 