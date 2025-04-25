'use client'

import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

// تعریف نوع داده‌های کانتکست
export interface HeaderContextType {
  // حالت‌های منوی موبایل
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileView: string;
  setMobileView: React.Dispatch<React.SetStateAction<string>>;
  expandedMobileMenu: string | null;
  setExpandedMobileMenu: React.Dispatch<React.SetStateAction<string | null>>;
  
  // منوی کارفرما
  employerButtonRef: React.RefObject<HTMLButtonElement | null>;
  employerAnchorEl: HTMLElement | null;
  setEmployerAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  isEmployerHovered: boolean;
  setIsEmployerHovered: React.Dispatch<React.SetStateAction<boolean>>;
  
  // منوی کارجو
  candidateButtonRef: React.RefObject<HTMLButtonElement | null>;
  candidateAnchorEl: HTMLElement | null;
  setCandidateAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  isCandidateHovered: boolean;
  setIsCandidateHovered: React.Dispatch<React.SetStateAction<boolean>>;
  
  // توابع مدیریت رویدادها
  handleDrawerToggle: () => void;
  handleEmployerMouseEnter: () => void;
  handleEmployerMouseLeave: () => void;
  handleCandidateMouseEnter: () => void;
  handleCandidateMouseLeave: () => void;
  handlePopoverMouseEnter: (type: 'employer' | 'candidate') => void;
  handlePopoverMouseLeave: (type: 'employer' | 'candidate') => void;
  toggleMobileMenu: (menuName: string) => void;
  handleMobileNavigation: (view: string) => void;
}

// ایجاد کانتکست
export const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// پراویدر کانتکست
interface HeaderProviderProps {
  children: ReactNode;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState('main');

  const employerButtonRef = useRef<HTMLButtonElement>(null);
  const candidateButtonRef = useRef<HTMLButtonElement>(null);
  
  const [employerAnchorEl, setEmployerAnchorEl] = useState<null | HTMLElement>(null);
  const [candidateAnchorEl, setCandidateAnchorEl] = useState<null | HTMLElement>(null);
  const [isEmployerHovered, setIsEmployerHovered] = useState(false);
  const [isCandidateHovered, setIsCandidateHovered] = useState(false);
  
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setExpandedMobileMenu(null);
  };

  const handleEmployerMouseEnter = () => {
    if (isMobile) return;
    setCandidateAnchorEl(null);
    setIsCandidateHovered(false);
    setEmployerAnchorEl(employerButtonRef.current);
    setIsEmployerHovered(true);
  };

  const handleEmployerMouseLeave = () => {
    if (isMobile) return;
    
    setTimeout(() => {
      const employerMenu = document.getElementById('employer-menu-content');
      const isOverEmployerMenu = employerMenu ? employerMenu.matches(':hover') : false;
      const isOverButton = employerButtonRef.current ? employerButtonRef.current.matches(':hover') : false;
      
      if (!isOverEmployerMenu && !isOverButton) {
        setIsEmployerHovered(false);
      }
    }, 100);
  };

  const handleCandidateMouseEnter = () => {
    if (isMobile) return;
    setEmployerAnchorEl(null);
    setIsEmployerHovered(false);
    setCandidateAnchorEl(candidateButtonRef.current);
    setIsCandidateHovered(true);
  };

  const handleCandidateMouseLeave = () => {
    if (isMobile) return;
    
    setTimeout(() => {
      const candidateMenu = document.getElementById('candidate-menu-content');
      const isOverCandidateMenu = candidateMenu ? candidateMenu.matches(':hover') : false;
      const isOverButton = candidateButtonRef.current ? candidateButtonRef.current.matches(':hover') : false;
      
      if (!isOverCandidateMenu && !isOverButton) {
        setIsCandidateHovered(false);
      }
    }, 100);
  };

  const handlePopoverMouseEnter = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      setCandidateAnchorEl(null);
      setIsCandidateHovered(false);
      setIsEmployerHovered(true);
    } else {
      setEmployerAnchorEl(null);
      setIsEmployerHovered(false);
      setIsCandidateHovered(true);
    }
  };

  const handlePopoverMouseLeave = (type: 'employer' | 'candidate') => {
    if (type === 'employer') {
      setTimeout(() => {
        const isOverButton = employerButtonRef.current ? employerButtonRef.current.matches(':hover') : false;
        const employerMenu = document.getElementById('employer-menu-content');
        const isOverMenu = employerMenu ? employerMenu.matches(':hover') : false;

        if (!isOverButton && !isOverMenu) {
          setIsEmployerHovered(false);
        }
      }, 100);
    } else {
      setTimeout(() => {
        const isOverButton = candidateButtonRef.current ? candidateButtonRef.current.matches(':hover') : false;
        const candidateMenu = document.getElementById('candidate-menu-content');
        const isOverMenu = candidateMenu ? candidateMenu.matches(':hover') : false;

        if (!isOverButton && !isOverMenu) {
          setIsCandidateHovered(false);
        }
      }, 100);
    }
  };

  const toggleMobileMenu = (menuName: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuName ? null : menuName);
  };

  const handleMobileNavigation = (view: string) => {
    if (view === mobileView && mobileOpen) {
      setMobileOpen(false);
    } else {
      setMobileView(view);
      if (view !== 'main') {
        setMobileOpen(true);
      }
    }
  };

  const value = {
    isMobile,
    mobileOpen,
    setMobileOpen,
    mobileView,
    setMobileView,
    expandedMobileMenu,
    setExpandedMobileMenu,
    employerButtonRef,
    employerAnchorEl,
    setEmployerAnchorEl,
    isEmployerHovered,
    setIsEmployerHovered,
    candidateButtonRef,
    candidateAnchorEl,
    setCandidateAnchorEl,
    isCandidateHovered,
    setIsCandidateHovered,
    handleDrawerToggle,
    handleEmployerMouseEnter,
    handleEmployerMouseLeave,
    handleCandidateMouseEnter,
    handleCandidateMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
    toggleMobileMenu,
    handleMobileNavigation
  };

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
};

// هوک برای دسترسی آسان به کانتکست
export const useHeaderContext = (): HeaderContextType => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}; 