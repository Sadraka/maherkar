// Common interfaces for admin components

export interface User {
  id: string;
  full_name: string;
  phone: string;
  user_type: string;
  status: string;
  joined_date: string;
  is_active: boolean;
  last_updated: string;
  last_login?: string;
  is_staff?: boolean;
  groups?: string[];
  profile_picture?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  industry?: {
    name: string;
  };
  location?: {
    name: string;
  };
  number_of_employees?: number;
  created_at: string;
  is_active: boolean;
}

export interface Job {
  id: string;
  advertisement: {
    title: string;
    status: string;
    location?: {
      name: string;
    };
    degree?: string;
    created_at: string;
  };
  company?: {
    name: string;
  };
}

export interface JobApplication {
  id: string;
  job_seeker: {
    id: string;
    full_name: string;
    phone: string;
  };
  advertisement: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  cover_letter: string;
  status: 'PE' | 'IR' | 'AC' | 'RE';
  employer_notes?: string;
  viewed_by_employer: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  user: {
    full_name: string;
    phone: string;
  };
  amount: number;
  status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  description?: string;
}

export interface Subscription {
  id: string;
  user: {
    full_name: string;
    phone: string;
  };
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  price: number;
  features: string[];
}

export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  activeSubscriptions: number;
  recentActivity: any[];
}

// Utility types
export type UserType = 'JS' | 'EM' | 'AD' | 'SU';
export type UserStatus = 'ACT' | 'SUS' | 'DEL';
export type ApplicationStatus = 'PE' | 'IR' | 'AC' | 'RE';
export type SortOrder = 'asc' | 'desc'; 