'use client'

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/axios';
import ExpertCard, { ExpertType } from '@/components/home/ExpertCard';
import ResumeAdCardSkeleton from './ResumeAdCardSkeleton';

// تابع پردازش URL تصویر پروفایل
const processProfilePicture = (profilePicture?: string): string => {
  if (!profilePicture) {
    // اگر تصویر پروفایل وجود نداشت، تصویر پیش‌فرض را برگردان
    return ''; // آواتار MUI به صورت خودکار حرف اول نام کاربر را نمایش می‌دهد
  }

  // اگر URL کامل باشد (با http یا https شروع شود)، همان را برگردان
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }

  // اگر URL نسبی باشد، آن را به URL کامل تبدیل کن
  // فرض می‌کنیم که تصاویر در دامنه اصلی سایت ذخیره شده‌اند
  if (profilePicture.startsWith('/')) {
    // اگر با / شروع شود، آن را به URL کامل تبدیل کن
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${profilePicture}`;
  }

  // در غیر این صورت، فرض می‌کنیم که مسیر نسبی به دایرکتوری media است
  return `${process.env.NEXT_PUBLIC_API_URL || ''}/media/${profilePicture}`;
};

// تایپ مهارت از بک‌اند
type SkillType = {
  id?: number;
  skill?: number | {
    id: number;
    name: string;
    icon?: string;
    industry: {
      id: number;
      name: string;
    };
  };
  level: string;
};

// تایپ رزومه از بک‌اند
type ResumeType = {
  id: number;
  years_of_experience?: number;
  headline?: string;
  bio?: string;
  website?: string;
  linkedin_profile?: string;
  experience?: string;
  expected_salary?: string;
  preferred_job_type?: string;
  availability?: string;
};

// تعریف تایپ آگهی رزومه بر اساس API
export type ResumeAdType = {
  id: string;
  title: string;
  status: 'P' | 'A' | 'R';
  description?: string;

  // اطلاعات کاربر از job_seeker_detail
  job_seeker_detail?: {
    id: number;
    full_name: string;
    phone?: string;
    profile_picture?: string;
    user_type: string;
    status: string;
    joined_date: string;
    last_updated: string;
    is_active: boolean;
    is_admin: boolean;
    last_login?: string;
  };

  // اطلاعات مکان از location_detail
  location_detail?: {
    id: number;
    name: string;
    province?: {
      id: number;
      name: string;
    };
  };

  // اطلاعات صنعت از industry_detail
  industry_detail?: {
    id: number;
    name: string;
  };

  // اطلاعات آگهی
  salary?: string;
  job_type?: string;
  degree?: string;
  gender?: string;
  soldier_status?: string;

  // فیلدهای مستقیم
  job_seeker: number;
  resume: number;
  industry: number;
  advertisement: string | {
    id: string;
    subscription?: {
      id: string;
      plan?: {
        name: string;
        price: number;
      };
      subscription_status?: string;
    };
  };
  location: number;

  // تاریخ‌ها
  created_at: string;
  updated_at: string;
};

interface ResumeAdCardProps {
  resumeAd: ResumeAdType;
  onUpdate: () => void;
}



// تابع تبدیل مهارت‌های API به آرایه رشته
const convertSkillsToStringArray = (skills: SkillType[], availableSkills: any[] = []): string[] => {
  return skills.map(skill => {
    if (typeof skill.skill === 'object' && skill.skill?.name) {
      return skill.skill.name;
    } else if (typeof skill.skill === 'number') {
      // اگر skill یک ID است، از availableSkills نام را پیدا کن
      const foundSkill = availableSkills.find(s => s.id === skill.skill);
      return foundSkill?.name || 'مهارت نامشخص';
    }
    return 'مهارت نامشخص';
  });
};

// تابع تبدیل ResumeAdType به ExpertType
const convertResumeAdToExpert = (resumeAd: ResumeAdType, skills: string[], resume?: ResumeType): ExpertType => {
  // تعیین نوع اشتراک بر اساس اطلاعات آگهی
  let subscription_type = undefined;
  
  if (resumeAd.advertisement && typeof resumeAd.advertisement === 'string') {
    // اگر اطلاعات اشتراک موجود نیست، مقدار پیش‌فرض را استفاده می‌کنیم
    subscription_type = 'پایه';
  } else if (resumeAd.advertisement && typeof resumeAd.advertisement === 'object') {
    // تعیین نوع اشتراک بر اساس نام طرح
    if (resumeAd.advertisement.subscription?.plan?.name === 'ladder') {
      subscription_type = 'نردبان';
    } else if (resumeAd.advertisement.subscription?.plan?.name === 'urgent') {
      subscription_type = 'فوری';
    } else if (resumeAd.advertisement.subscription?.plan?.name === 'basic') {
      subscription_type = 'پایه';
    }
  }
  
  return {
    id: parseInt(resumeAd.id) || 0,
    resumeId: resumeAd.resume || 0, // استفاده از شناسه رزومه برای لینک مشاهده رزومه
    name: resumeAd.job_seeker_detail?.full_name || 'کاربر ماهرکار',
    username: resumeAd.job_seeker_detail?.full_name?.replace(/\s+/g, '_').toLowerCase() || 'user',
    phone: resumeAd.job_seeker_detail?.phone,
    jobTitle: resume?.headline || '',
    title: resumeAd.title,
    avatar: processProfilePicture(resumeAd.job_seeker_detail?.profile_picture),
    bio: resume?.bio || resumeAd.description,
    status: resumeAd.status,
    subscription_type: subscription_type, // اضافه کردن نوع اشتراک
    location: resumeAd.location_detail?.name || 'موقعیت نامشخص',
    skills: skills, // مهارت‌های واقعی از API
    isVerified: true, // فرض می‌کنیم کاربران آگهی‌دهنده تایید شده‌اند
    industry: resumeAd.industry_detail?.name,
    experienceYears: resume?.years_of_experience, // سال‌های تجربه واقعی از رزومه
    preferredJobType: resume?.preferred_job_type || resumeAd.job_type,
    expectedSalary: resume?.expected_salary || resumeAd.salary,
    degree: resumeAd.degree,
    gender: resumeAd.gender,
    soldierStatus: resumeAd.soldier_status,
    website: resume?.website,
    linkedinProfile: resume?.linkedin_profile,
    availability: resume?.availability,
    experience: resume?.experience,
    createdAt: resumeAd.created_at,
    updatedAt: resumeAd.updated_at,
  };
};



export default function ResumeAdCard({ resumeAd, onUpdate }: ResumeAdCardProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [resume, setResume] = useState<ResumeType | undefined>();
  const [loading, setLoading] = useState(true);

  // دریافت مهارت‌ها و رزومه کاربر از API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsResponse, resumeResponse, availableSkillsResponse] = await Promise.all([
          apiGet('/resumes/skills/'),
          apiGet('/resumes/resumes/'),
          apiGet('/industries/skills/')
        ]);

        // پردازش مهارت‌ها با availableSkills
        const skillsData = skillsResponse.data as SkillType[];
        const availableSkills = Array.isArray(availableSkillsResponse.data) ? availableSkillsResponse.data : [];
        const skillNames = convertSkillsToStringArray(skillsData, availableSkills);
        setSkills(skillNames);

        // پردازش رزومه
        const resumesData = Array.isArray(resumeResponse.data) ? resumeResponse.data : [];
        if (resumesData.length > 0) {
          setResume(resumesData[0] as ResumeType);
        }

      } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
        setSkills([]); // در صورت خطا، مهارت‌ها خالی باشد
        setResume(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // تبدیل ResumeAdType به ExpertType با اطلاعات واقعی
  const expertData = convertResumeAdToExpert(resumeAd, skills, resume);
  
  // چاپ اطلاعات مربوط به عکس پروفایل برای دیباگ
  console.log('Profile Picture URL (original):', resumeAd.job_seeker_detail?.profile_picture);
  console.log('Avatar in expertData (processed):', expertData.avatar);
  
  // اطمینان از اینکه آواتار مقدار معتبری دارد
  if (expertData.avatar && typeof expertData.avatar !== 'string') {
    console.error('Avatar is not a string:', expertData.avatar);
    expertData.avatar = ''; // تنظیم به رشته خالی در صورت نامعتبر بودن
  }

  // در حالت لودینگ، اسکلتون نمایش بده
  if (loading) {
    return <ResumeAdCardSkeleton />;
  }

  return (
    <ExpertCard expert={expertData} />
  );
}