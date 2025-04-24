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
  
  // منوی راهنما
  helpButtonRef: React.RefObject<HTMLButtonElement | null>;
  helpAnchorEl: HTMLElement | null;
  setHelpAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  isHelpHovered: boolean;
  setIsHelpHovered: React.Dispatch<React.SetStateAction<boolean>>;
  
  // توابع مدیریت رویدادها
  handleDrawerToggle: () => void;
  handleEmployerMouseEnter: () => void;
  handleEmployerMouseLeave: () => void;
  handleCandidateMouseEnter: () => void;
  handleCandidateMouseLeave: () => void;
  handleHelpMouseEnter: () => void;
  handleHelpMouseLeave: () => void;
  handlePopoverMouseEnter: (type: 'employer' | 'candidate' | 'help') => void;
  handlePopoverMouseLeave: (type: 'employer' | 'candidate' | 'help') => void;
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
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  
  const [employerAnchorEl, setEmployerAnchorEl] = useState<null | HTMLElement>(null);
  const [candidateAnchorEl, setCandidateAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [isEmployerHovered, setIsEmployerHovered] = useState(false);
  const [isCandidateHovered, setIsCandidateHovered] = useState(false);
  const [isHelpHovered, setIsHelpHovered] = useState(false);
  
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setExpandedMobileMenu(null);
  };

  const handleEmployerMouseEnter = () => {
    if (isMobile) return;
    setCandidateAnchorEl(null);
    setIsCandidateHovered(false);
    setHelpAnchorEl(null);
    setIsHelpHovered(false);
    setEmployerAnchorEl(employerButtonRef.current);
    setIsEmployerHovered(true);
  };

  const handleEmployerMouseLeave = () => {
    if (isMobile) return;
    setTimeout(() => {
      const employerMenu = document.getElementById('employer-menu-content');
      const isOverEmployerMenu = employerMenu ? employerMenu.matches(':hover') : false;
      
      if (!isOverEmployerMenu && employerButtonRef.current && !employerButtonRef.current.matches(':hover')) {
        setIsEmployerHovered(false);
      }
    }, 50);
  };

  const handleCandidateMouseEnter = () => {
    if (isMobile) return;
    setEmployerAnchorEl(null);
    setIsEmployerHovered(false);
    setHelpAnchorEl(null);
    setIsHelpHovered(false);
    setCandidateAnchorEl(candidateButtonRef.current);
    setIsCandidateHovered(true);
  };

  const handleCandidateMouseLeave = () => {
    if (isMobile) return;
    setTimeout(() => {
      const candidateMenu = document.getElementById('candidate-menu-content');
      const isOverCandidateMenu = candidateMenu ? candidateMenu.matches(':hover') : false;
      
      if (!isOverCandidateMenu && candidateButtonRef.current && !candidateButtonRef.current.matches(':hover')) {
        setIsCandidateHovered(false);
      }
    }, 50);
  };

  const handleHelpMouseEnter = () => {
    if (isMobile) return;
    setEmployerAnchorEl(null);
    setIsEmployerHovered(false);
    setCandidateAnchorEl(null);
    setIsCandidateHovered(false);
    setHelpAnchorEl(helpButtonRef.current);
    setIsHelpHovered(true);
  };

  const handleHelpMouseLeave = () => {
    if (isMobile) return;
    setTimeout(() => {
      const helpMenu = document.getElementById('help-menu-content');
      const isOverHelpMenu = helpMenu ? helpMenu.matches(':hover') : false;
      
      if (!isOverHelpMenu && helpButtonRef.current && !helpButtonRef.current.matches(':hover')) {
        setIsHelpHovered(false);
      }
    }, 50);
  };

  const handlePopoverMouseEnter = (type: 'employer' | 'candidate' | 'help') => {
    if (type === 'employer') {
      setCandidateAnchorEl(null);
      setIsCandidateHovered(false);
      setHelpAnchorEl(null);
      setIsHelpHovered(false);
      setIsEmployerHovered(true);
    } else if (type === 'candidate') {
      setEmployerAnchorEl(null);
      setIsEmployerHovered(false);
      setHelpAnchorEl(null);
      setIsHelpHovered(false);
      setIsCandidateHovered(true);
    } else {
      setEmployerAnchorEl(null);
      setIsEmployerHovered(false);
      setCandidateAnchorEl(null);
      setIsCandidateHovered(false);
      setIsHelpHovered(true);
    }
  };

  const handlePopoverMouseLeave = (type: 'employer' | 'candidate' | 'help') => {
    if (type === 'employer') {
      if (employerButtonRef.current && !employerButtonRef.current.matches(':hover')) {
        setIsEmployerHovered(false);
      }
    } else if (type === 'candidate') {
      if (candidateButtonRef.current && !candidateButtonRef.current.matches(':hover')) {
        setIsCandidateHovered(false);
      }
    } else {
      if (helpButtonRef.current && !helpButtonRef.current.matches(':hover')) {
        setIsHelpHovered(false);
      }
    }
  };

  const toggleMobileMenu = (menuName: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuName ? null : menuName);
  };

  const handleMobileNavigation = (view: string) => {
    setMobileView(view);
    if (view !== 'main') {
      setMobileOpen(true);
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
    helpButtonRef,
    helpAnchorEl,
    setHelpAnchorEl,
    isHelpHovered,
    setIsHelpHovered,
    handleDrawerToggle,
    handleEmployerMouseEnter,
    handleEmployerMouseLeave,
    handleCandidateMouseEnter,
    handleCandidateMouseLeave,
    handleHelpMouseEnter,
    handleHelpMouseLeave,
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