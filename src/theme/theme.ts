import { createTheme } from '@mui/material/styles';
import {
  EMPLOYER_BLUE,
  EMPLOYER_LIGHT_BLUE,
  EMPLOYER_DARK_BLUE,
  JOB_SEEKER_GREEN,
  JOB_SEEKER_LIGHT_GREEN,
  JOB_SEEKER_DARK_GREEN
} from '../constants/colors';

declare module '@mui/material/styles' {
  interface Palette {
    employer: Palette['primary'];
    candidate: Palette['primary'];
  }
  interface PaletteOptions {
    employer?: PaletteOptions['primary'];
    candidate?: PaletteOptions['primary'];
  }
}

// رنگ‌های اصلی برای استفاده در سایت
// const NAVY_BLUE = '#0a3b79'; // سرمه‌ای برای کارفرما
// const LIGHT_NAVY = '#2957a4'; // سرمه‌ای روشن‌تر
// const DARK_NAVY = '#062758'; // سرمه‌ای تیره‌تر
// const GREEN = '#0a7940'; // سبز برای کارجو
// const LIGHT_GREEN = '#34b96b'; // سبز روشن‌تر
// const DARK_GREEN = '#075e31'; // سبز تیره‌تر

// رنگ‌های اختصاصی کارجو طبق JobSeekerThemeContext
// const JOB_SEEKER_GREEN = '#1e8e3e'; // سبز پررنگ
// const JOB_SEEKER_LIGHT_GREEN = '#34a853'; // سبز روشن‌تر
// const JOB_SEEKER_DARK_GREEN = '#137333'; // سبز خیلی تیره

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'IRANSansX, Roboto, Arial',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.95rem',
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: EMPLOYER_BLUE,
      light: EMPLOYER_LIGHT_BLUE,
      dark: EMPLOYER_DARK_BLUE,
      contrastText: '#fff',
    },
    secondary: {
      main: JOB_SEEKER_GREEN,
      light: JOB_SEEKER_LIGHT_GREEN,
      dark: JOB_SEEKER_DARK_GREEN,
      contrastText: '#fff',
    },
    success: {
      main: JOB_SEEKER_GREEN,
      light: JOB_SEEKER_LIGHT_GREEN,
      dark: JOB_SEEKER_DARK_GREEN,
      contrastText: '#fff',
    },
    // رنگ‌های اختصاصی برای کارفرما و کارجو
    employer: {
      main: EMPLOYER_BLUE,
      light: EMPLOYER_LIGHT_BLUE,
      dark: EMPLOYER_DARK_BLUE,
      contrastText: '#fff',
    },
    candidate: {
      main: JOB_SEEKER_GREEN,
      light: JOB_SEEKER_LIGHT_GREEN,
      dark: JOB_SEEKER_DARK_GREEN,
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontFamily: 'IRANSansX',
          fontSize: '0.95rem',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${EMPLOYER_LIGHT_BLUE} 0%, ${EMPLOYER_BLUE} 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${JOB_SEEKER_LIGHT_GREEN} 0%, ${JOB_SEEKER_GREEN} 100%)`,
        },
        containedSuccess: {
          background: JOB_SEEKER_GREEN,
          '&:hover': {
            background: JOB_SEEKER_GREEN,
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: 'IRANSansX',
          '& .MuiInputLabel-root': {
            fontFamily: 'IRANSansX',
          },
          '& .MuiOutlinedInput-root': {
            fontFamily: 'IRANSansX',
            borderRadius: '8px',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: EMPLOYER_BLUE,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'IRANSansX',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: 'IRANSansX',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'IRANSansX',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme; 