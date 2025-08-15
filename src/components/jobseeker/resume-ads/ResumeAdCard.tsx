'use client'

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/axios';
import ExpertCard, { ExpertType } from '@/components/home/ExpertCard';

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
  advertisement: string;
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
const convertSkillsToStringArray = (skills: SkillType[]): string[] => {
  return skills.map(skill => {
    if (typeof skill.skill === 'object' && skill.skill?.name) {
      return skill.skill.name;
    }
    return 'مهارت نامشخص';
  });
};

// تابع تبدیل ResumeAdType به ExpertType
const convertResumeAdToExpert = (resumeAd: ResumeAdType, skills: string[], resume?: ResumeType): ExpertType => {
  return {
    id: parseInt(resumeAd.id) || 0,
    name: resumeAd.job_seeker_detail?.full_name || 'کاربر ماهرکار',
    username: resumeAd.job_seeker_detail?.full_name?.replace(/\s+/g, '_').toLowerCase() || 'user',
    phone: resumeAd.job_seeker_detail?.phone,
    jobTitle: resume?.headline || resumeAd.title,
    avatar: resumeAd.job_seeker_detail?.profile_picture || '',
    bio: resume?.bio || resumeAd.description,
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
        const [skillsResponse, resumeResponse] = await Promise.all([
          apiGet('/resumes/skills/'),
          apiGet('/resumes/resumes/')
        ]);

        // پردازش مهارت‌ها
        const skillsData = skillsResponse.data as SkillType[];
        const skillNames = convertSkillsToStringArray(skillsData);
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

  // در حالت لودینگ، کارت با اطلاعات محدود نمایش بده
  if (loading) {
    return <ExpertCard expert={convertResumeAdToExpert(resumeAd, [], undefined)} />;
  }

  return (
    <ExpertCard expert={expertData} />
  );
}