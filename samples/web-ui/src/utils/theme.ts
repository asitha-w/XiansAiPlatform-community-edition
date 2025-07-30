import { createTheme } from '@mui/material/styles';

// Enhanced Scandinavian design principles: extreme simplicity, generous white space, subtle typography hierarchy
// Color palette inspired by Nordic nature: crisp whites, soft grays, muted earth tones

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E3440', // Dark blue-gray (Nordic storm)
      light: '#4C566A',
      dark: '#242933',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5E81AC', // Muted blue (Nordic sky)
      light: '#81A1C1',
      dark: '#4A6491',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FDFDFD', // Softer white (Nordic snow)
      paper: '#FEFEFE',
    },
    text: {
      primary: '#2E3440',
      secondary: '#556B7D', // Softer secondary text
    },
    grey: {
      50: '#FCFCFC',
      100: '#F8F9FA',
      200: '#F1F3F4',
      300: '#E8EAED',
      400: '#BDC1C6',
      500: '#80868B',
      600: '#5F6368',
      700: '#3C4043',
      800: '#202124',
      900: '#0D1117',
    },
    success: {
      main: '#A3BE8C', // Muted green (Nordic forest)
      light: '#B8CCA3',
      dark: '#8CA176',
    },
    warning: {
      main: '#EBCB8B', // Warm yellow (Nordic sun)
      light: '#F0D49C',
      dark: '#E5C078',
    },
    error: {
      main: '#BF616A', // Muted red (Nordic aurora)
      light: '#CC7B83',
      dark: '#B34A55',
    },
    info: {
      main: '#88C0D0', // Light blue (Nordic ice)
      light: '#9BCAD7',
      dark: '#75ACBE',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Main headers - simplified scale
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    // Body text - two consistent sizes
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.8rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
      fontWeight: 400,
    },
    // Small text for metadata
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      fontWeight: 400,
      color: '#80868B',
    },
  },
  spacing: 8, // Generous 8px base spacing for better rhythm
  shape: {
    borderRadius: 12, // Slightly more rounded for softer feel
  },
  shadows: [
    'none',
    '0 1px 3px rgba(46, 52, 64, 0.02)', // Very subtle shadows
    '0 2px 6px rgba(46, 52, 64, 0.03)',
    '0 4px 12px rgba(46, 52, 64, 0.04)',
    '0 6px 16px rgba(46, 52, 64, 0.05)',
    // Continue with minimal shadows...
    '0 8px 20px rgba(46, 52, 64, 0.06)',
    '0 12px 28px rgba(46, 52, 64, 0.07)',
    '0 16px 36px rgba(46, 52, 64, 0.08)',
    '0 20px 44px rgba(46, 52, 64, 0.09)',
    '0 24px 52px rgba(46, 52, 64, 0.10)',
    '0 28px 60px rgba(46, 52, 64, 0.11)',
    '0 32px 68px rgba(46, 52, 64, 0.12)',
    '0 36px 76px rgba(46, 52, 64, 0.13)',
    '0 40px 84px rgba(46, 52, 64, 0.14)',
    '0 44px 92px rgba(46, 52, 64, 0.15)',
    '0 48px 100px rgba(46, 52, 64, 0.16)',
    '0 52px 108px rgba(46, 52, 64, 0.17)',
    '0 56px 116px rgba(46, 52, 64, 0.18)',
    '0 60px 124px rgba(46, 52, 64, 0.19)',
    '0 64px 132px rgba(46, 52, 64, 0.20)',
    '0 68px 140px rgba(46, 52, 64, 0.21)',
    '0 72px 148px rgba(46, 52, 64, 0.22)',
    '0 76px 156px rgba(46, 52, 64, 0.23)',
    '0 80px 164px rgba(46, 52, 64, 0.24)',
    '0 84px 172px rgba(46, 52, 64, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FDFDFD',
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 500,
          padding: '10px 20px',
          boxShadow: 'none',
          fontSize: '0.875rem', // Matches body1
          letterSpacing: '0.01em',
          '&:hover': {
            boxShadow: '0 2px 12px rgba(46, 52, 64, 0.08)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: '#2E3440',
          '&:hover': {
            background: '#242933',
          },
        },
        outlined: {
          borderColor: '#F1F3F4',
          borderWidth: '0.5px',
          color: '#556B7D',
          '&:hover': {
            borderColor: '#E8EAED',
            backgroundColor: 'rgba(46, 52, 64, 0.02)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: '0.5px solid #F8F9FA',
          backgroundColor: '#FEFEFE',
          '&:hover': {
            border: '0.5px solid #F1F3F4',
            boxShadow: '0 2px 12px rgba(46, 52, 64, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: '0.5px solid #F8F9FA',
          backgroundColor: '#FEFEFE',
        },
        elevation0: {
          boxShadow: 'none',
          border: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: '0.5px solid #F8F9FA',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FEFEFE',
            '& fieldset': {
              borderColor: '#F1F3F4',
              borderWidth: '0.5px',
            },
            '&:hover fieldset': {
              borderColor: '#E8EAED',
              borderWidth: '0.5px',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5E81AC',
              borderWidth: '0.5px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontSize: '0.75rem',
          fontWeight: 500,
          height: 26,
        },
        outlined: {
          borderColor: '#F1F3F4',
          borderWidth: '0.5px',
          backgroundColor: 'transparent',
          color: '#556B7D',
          '&:hover': {
            backgroundColor: 'rgba(46, 52, 64, 0.02)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FEFEFE',
          color: '#2E3440',
          boxShadow: 'none',
          borderBottom: '0.5px solid #F8F9FA',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover': {
            backgroundColor: 'rgba(46, 52, 64, 0.04)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '0.5px solid #F8F9FA',
          padding: '16px 20px',
        },
        head: {
          backgroundColor: '#FCFCFC',
          fontWeight: 600,
          fontSize: '0.75rem', // Matches caption
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#80868B',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: 'none',
          fontSize: '0.875rem', // Matches body1
        },
        standardInfo: {
          backgroundColor: '#F0F7FF',
          color: '#2E3440',
        },
        standardWarning: {
          backgroundColor: '#FFF8E7',
          color: '#2E3440',
        },
        standardError: {
          backgroundColor: '#FFF0F0',
          color: '#2E3440',
        },
        standardSuccess: {
          backgroundColor: '#F0F8F0',
          color: '#2E3440',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem', // Matches body1
          fontWeight: 500,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F1F3F4',
            borderWidth: '0.5px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E8EAED',
            borderWidth: '0.5px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5E81AC',
            borderWidth: '0.5px',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#F8F9FA',
          borderWidth: '0.5px',
        },
      },
    },
  },
});

export default theme; 