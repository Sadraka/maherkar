'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { JOB_SEEKER_THEME } from '../constants/colors';

interface JobSeekerThemeColors {
  primary: string;
  light: string;
  dark: string;
  bgLight: string;
  bgVeryLight: string;
  red: string;
}

// استفاده از رنگ‌های تعریف شده در فایل colors.ts
const defaultJobSeekerColors: JobSeekerThemeColors = JOB_SEEKER_THEME;

const JobSeekerThemeContext = createContext<JobSeekerThemeColors>(defaultJobSeekerColors);

export const useJobSeekerTheme = () => useContext(JobSeekerThemeContext);

interface JobSeekerThemeProviderProps {
  children: ReactNode;
}

export const JobSeekerThemeProvider = ({ children }: JobSeekerThemeProviderProps) => {
  // می‌توانیم در اینجا مقادیر رنگ را به صورت پویا تغییر دهیم اگر نیاز باشد
  
  return (
    <JobSeekerThemeContext.Provider value={defaultJobSeekerColors}>
      {children}
    </JobSeekerThemeContext.Provider>
  );
};

export default JobSeekerThemeContext; 