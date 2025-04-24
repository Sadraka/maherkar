import { createTheme } from '@mui/material/styles';

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
const NAVY_BLUE = '#0a3b79'; // سرمه‌ای برای کارفرما
const LIGHT_NAVY = '#2957a4'; // سرمه‌ای روشن‌تر
const DARK_NAVY = '#062758'; // سرمه‌ای تیره‌تر
const GREEN = '#0a7940'; // سبز برای کارجو
const LIGHT_GREEN = '#34b96b'; // سبز روشن‌تر
const DARK_GREEN = '#075e31'; // سبز تیره‌تر

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Vazirmatn, Roboto, Arial',
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
      main: NAVY_BLUE,
      light: LIGHT_NAVY,
      dark: DARK_NAVY,
      contrastText: '#fff',
    },
    secondary: {
      main: GREEN,
      light: LIGHT_GREEN,
      dark: DARK_GREEN,
      contrastText: '#fff',
    },
    // رنگ‌های اختصاصی برای کارفرما و کارجو
    employer: {
      main: NAVY_BLUE,
      light: LIGHT_NAVY,
      dark: DARK_NAVY,
      contrastText: '#fff',
    },
    candidate: {
      main: GREEN,
      light: LIGHT_GREEN,
      dark: DARK_GREEN,
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
          fontFamily: 'Vazirmatn',
          fontSize: '0.95rem',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${LIGHT_NAVY} 0%, ${NAVY_BLUE} 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${LIGHT_GREEN} 0%, ${GREEN} 100%)`,
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
          fontFamily: 'Vazirmatn',
          '& .MuiInputLabel-root': {
            fontFamily: 'Vazirmatn',
          },
          '& .MuiOutlinedInput-root': {
            fontFamily: 'Vazirmatn',
            borderRadius: '8px',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: NAVY_BLUE,
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
          fontFamily: 'Vazirmatn',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: 'Vazirmatn',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'Vazirmatn',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme; 