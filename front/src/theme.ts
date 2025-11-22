import { createTheme } from '@mui/material/styles';

// Darker, more sophisticated color palette
// Deep blues and teals for a professional, elegant look

const colors = {
  primary: {
    main: '#1d4ed8', // Deep Blue - darker, more sophisticated
    light: '#3b82f6',
    dark: '#1e3a8a',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0d9488', // Deep Teal - richer, more elegant
    light: '#14b8a6',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // Emerald
    light: '#6ee7b7',
    dark: '#047857',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444', // Red
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fcd34d',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6', // Blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
};

// Custom color palette for home screen and other components
// You can change these values to customize the entire theme
const customColors = {
  // Background colors
  bgLight: {
    primary: '#f8fafc',
    secondary: '#dbeafe',
    tertiary: '#bfdbfe',
    quaternary: '#ddd6fe',
    paper: '#ffffff',
    paperAlt: '#fafbff',
  },
  bgDark: {
    primary: '#0a0e1a',
    secondary: '#131827',
    tertiary: '#1e293b',
    quaternary: '#1a1f35',
    paper: '#131827',
    paperAlt: '#252d48',
  },

  // Text colors
  textLight: {
    primary: '#0f172a',
    secondary: '#475569',
  },
  textDark: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
  },

  // Accent colors (used in gradients, highlights, etc.)
  accent: {
    blue: {
      main: '#1d4ed8',
      light: '#3b82f6',
      lighter: '#60a5fa',
      dark: '#1e3a8a',
      darker: '#1e40af',
    },
    teal: {
      main: '#0d9488',
      light: '#14b8a6',
      lighter: '#5eead4',
      dark: '#0f766e',
      darker: '#134e4a',
    },
    slate: {
      light: '#f8fafc',
      main: '#64748b',
      dark: '#1e293b',
      darker: '#0f172a',
    },
    pink: {
      main: '#fa709a',
      light: 'rgba(250, 112, 154, 0.2)',
      lighter: 'rgba(250, 112, 154, 0.15)',
    },
    error: {
      main: '#f44336',
      light: 'rgba(244, 67, 54, 0.1)',
      lighter: 'rgba(244, 67, 54, 0.05)',
    },
    cyan: {
      main: '#0093E9',
      light: 'rgba(0, 147, 233, 0.15)',
    },
    red: {
      main: '#f5576c',
      light: 'rgba(245, 87, 108, 0.15)',
    },
  },

  // Gradient definitions
  gradients: {
    primary: 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)',
    primaryReverse: 'linear-gradient(135deg, #0d9488 0%, #1d4ed8 100%)',
    primaryDark: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',

    // Hero/Headline backgrounds
    heroLight: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 40%, #bfdbfe 70%, #ddd6fe 100%)',
    heroDark: 'linear-gradient(135deg, #0a0e1a 0%, #131827 40%, #1e293b 100%)',

    // Text gradients
    textLight: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
    textLightAlt: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    textLightSecondary: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
    textDark: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #3b82f6 100%)',
    textDarkAlt: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 100%)',
    textDarkSecondary: 'linear-gradient(135deg, #ffffff 0%, #14b8a6 100%)',

    // Card/Paper backgrounds
    cardLight: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
    cardLightAlt: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    cardDark: 'linear-gradient(135deg, #1a1f35 0%, #252d48 100%)',
    cardDarkAlt: 'linear-gradient(135deg, #131827 0%, #1e293b 100%)',

    // Footer backgrounds
    footerLight: 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)',
    footerDark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',

    // Badge/Chip backgrounds
    badgeLight: 'linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%)',
    badgeDark: 'linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',

    // Icon backgrounds
    iconLight: 'linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',
    iconDark: 'linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',

    // Overlay gradients
    overlayLight: 'linear-gradient(180deg, transparent 50%, rgba(29, 78, 216, 0.3) 100%)',
    overlayDark: 'linear-gradient(180deg, transparent 50%, rgba(29, 78, 216, 0.3) 100%)',

    // Feature pill gradients
    successLight: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    successDark: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',
    primaryPillLight: 'linear-gradient(135deg, #ffffff 0%, #ede9fe 100%)',
    primaryPillDark: 'linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',
    
    // Category gradient (pink to yellow)
    category: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    
    // Language gradient (blue to teal)
    language: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    
    // Query types gradient (pink to red)
    queryTypes: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

    // Dashboard metric gradients (generic stat type gradients)
    metricStat1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  // Posts/Content
    metricStat2: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',  // Positive reactions
    metricStat3: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',  // Negative reactions
    metricStat4: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',  // Comments/Discussion
    metricStat5: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',  // Activity/Trending
    metricStat6: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',  // Average/Summary
    
    // Analytics metric gradients
    analyticsMetric1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  // Primary
    analyticsMetric2: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',  // Views
    analyticsMetric3: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',  // Likes
    analyticsMetric4: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',  // Shares
    analyticsMetric5: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',  // Audio/Media
    analyticsMetric6: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',  // Engagement
  },

  // Shadow colors (for box-shadow)
  shadows: {
    primary: 'rgba(29, 78, 216, 0.3)',
    primaryLight: 'rgba(29, 78, 216, 0.2)',
    primaryHeavy: 'rgba(29, 78, 216, 0.4)',
    secondary: 'rgba(13, 148, 136, 0.3)',
    secondaryLight: 'rgba(13, 148, 136, 0.2)',
    secondaryHeavy: 'rgba(13, 148, 136, 0.4)',
    success: 'rgba(16, 185, 129, 0.3)',
  },

  // Border colors
  borders: {
    primaryLight: 'rgba(29, 78, 216, 0.1)',
    primaryLightHover: 'rgba(29, 78, 216, 0.2)',
    primaryDark: 'rgba(29, 78, 216, 0.2)',
    primaryDarkHover: 'rgba(29, 78, 216, 0.3)',
    secondaryLight: 'rgba(13, 148, 136, 0.1)',
    secondaryLightHover: 'rgba(13, 148, 136, 0.15)',
    secondaryDark: 'rgba(13, 148, 136, 0.15)',
    secondaryDarkHover: 'rgba(13, 148, 136, 0.2)',
  },

  // Overlay colors (for transparent backgrounds, modals, etc.)
  overlay: {
    white: {
      subtle: 'rgba(255, 255, 255, 0.04)',
      veryLight: 'rgba(255, 255, 255, 0.08)',
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.5)',
      strong: 'rgba(255, 255, 255, 0.7)',
      stronger: 'rgba(255, 255, 255, 0.3)',
      veryStrong: 'rgba(255, 255, 255, 0.5)',
      almostOpaque: 'rgba(255, 255, 255, 0.8)',
      opaque: 'rgba(255, 255, 255, 0.9)',
      full: 'rgba(255, 255, 255, 0.95)',
    },
    black: {
      subtle: 'rgba(0, 0, 0, 0.04)',
      veryLight: 'rgba(0, 0, 0, 0.08)',
      light: 'rgba(0, 0, 0, 0.08)',
      medium: 'rgba(0, 0, 0, 0.5)',
      strong: 'rgba(0, 0, 0, 0.7)',
      stronger: 'rgba(0, 0, 0, 0.2)',
      veryStrong: 'rgba(0, 0, 0, 0.25)',
      almostOpaque: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Page background colors
  pageBackground: {
    light: '#E9EAF4',
    lighter: '#F5F6FA',
    white: '#FFFFFF',
    grayLight: '#ECE9F1',
  },

  // Neutral colors for text and UI elements
  neutral: {
    gray: {
      text: '#6D6E76',
      dark: '#2C3E50',
      border: '#E0E0E0',
    },
  },

  // Social media brand colors (keep consistent across platforms)
  social: {
    twitter: '#1DA1F2',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
  },

  // OAuth provider brand colors
  oauth: {
    google: '#4285F4',
    googleHover: '#357ae8',
    googleBg: 'rgba(66, 133, 244, 0.04)',
    apple: '#000000',
    appleHover: '#333333',
    appleBg: 'rgba(0, 0, 0, 0.04)',
  },

  // Chart colors for data visualization (generic sets for different purposes)
  charts: {
    primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    extended: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316'],
    // Dashboard metrics colors (generic stat types: views, users, time, engagement, reach, posts, likes, dislikes, comments, activity, average)
    metrics: {
      stat1: '#3b82f6',   // Views/Visibility metrics
      stat2: '#8b5cf6',   // User/People metrics
      stat3: '#f59e0b',   // Time/Duration metrics
      stat4: '#10b981',   // Engagement/Success metrics
      stat5: '#ec4899',   // Reach/Growth metrics
      stat6: '#1976d2',   // Posts/Content metrics
      stat7: '#2e7d32',   // Positive reactions
      stat8: '#d32f2f',   // Negative reactions
      stat9: '#ed6c02',   // Comments/Discussion metrics
      stat10: '#9c27b0',  // Activity/Trending metrics
      stat11: '#0288d1',  // Average/Summary metrics
    },
    // Analytics specific colors
    analytics: {
      metric1: '#2196f3',  // Page views
      metric2: '#4caf50',  // Likes
      metric3: '#ff9800',  // Shares
      metric4: '#9c27b0',  // Audio/Media
      metric5: '#00bcd4',  // Engagement rate
    },
    // Traffic sources and categories
    categories: ['#667eea', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'],
  },

  // Featured/special UI colors (generic names)
  featured: {
    highlight: '#FFD700',
    highlightBg: 'rgba(255, 215, 0, 0.1)',
  },

  // Analytics page colors
  analytics: {
    trafficSources: ['#667eea', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'],
    heroGradientDark: 'linear-gradient(135deg, #0a0e1a 0%, #131827 50%, #1e293b 100%)',
    heroGradientLight: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)',
    headerTextGradientDark: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerTextGradientLight: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
  },

  // Payment/modal colors
  payment: {
    brandColor: '#667eea',
  },

  // Icon colors (white for light backgrounds)
  icon: {
    onBrand: '#fff',  // White icons on branded backgrounds
  },

  // Text muted/secondary
  textMuted: '#6D6E76',

  // Status colors (generic positive/negative indicators)
  status: {
    positive: '#10b981',      // Success/growth indicator
    negative: '#ef4444',      // Error/decline indicator
    positiveAlpha: 'rgba(16, 185, 129, 0.1)',
    negativeAlpha: 'rgba(239, 68, 68, 0.1)',
  },

  // Graph/chart line colors (generic chart elements)
  graph: {
    primaryLine: {
      light: '#1d4ed8',
      dark: '#667eea',
    },
    secondaryLine: {
      light: '#7c3aed',
      dark: '#764ba2',
    },
    background: {
      light: '#ffffff',
      dark: '#0f172a',
    },
  },

  // Author page specific colors
  author: {
    headerGradientDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    headerGradientLight: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    radialOverlayDark: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)',
    radialOverlayLight: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    profileShadow: '0 8px 32px rgba(0,0,0,0.3)',
    profileBorder: '4px solid rgba(255,255,255,0.2)',
    statsBgOverlay: 'rgba(255,255,255,0.25)',
    statsItemBg: 'rgba(255,255,255,0.2)',
    statsItemHover: 'rgba(255,255,255,0.3)',
    contactButtonShadow: '0 4px 12px rgba(0,0,0,0.2)',
    contactButtonHover: 'rgba(255,255,255,0.95)',
    contactButtonHoverShadow: '0 6px 16px rgba(0,0,0,0.3)',
    bioCardBgDark: '#1e293b',
    bioCardBgLight: '#ffffff',
    bioCardBorder: '1px solid rgba(255,255,255,0.1)',
    articleCardShadowDark: '0 8px 24px rgba(99,102,241,0.3), 0 4px 12px rgba(0,0,0,0.5)',
    articleCardShadowLight: '0 8px 24px rgba(0,0,0,0.15)',
    articleCardBgDark: '#0f172a',
    articleCardBgLight: '#fafafa',
    articleCardGradientDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    categoryChipBgDark: 'rgba(99,102,241,0.2)',
    categoryChipBgLight: 'rgba(0,0,0,0.08)',
    categoryChipText: 'rgba(255,255,255,0.9)',
    categoryChipBorder: '1px solid rgba(99,102,241,0.3)',
    accentBlue: '#60a5fa',
    accentPurple: 'rgba(99,102,241,0.5)',
    accentPurpleHover: 'rgba(99,102,241,1)',
  },

  // Component-specific shadows (beyond the shadow colors already defined)
  componentShadows: {
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cardHover: '0 4px 12px rgba(0,0,0,0.08)',
    profileLight: '0 8px 32px rgba(29, 78, 216, 0.12)',
    profileDark: '0 8px 32px rgba(0, 0, 0, 0.5)',
    avatarBorderLight: '3px solid rgba(255, 255, 255, 0.1)',
    avatarBorderHeavyLight: '5px solid rgba(255, 255, 255, 0.1)',
    avatarShadowLight: '0 8px 24px rgba(29, 78, 216, 0.25)',
    avatarShadowDark: '0 8px 24px rgba(0, 0, 0, 0.5)',
    buttonPrimary: '0 4px 16px rgba(29, 78, 216, 0.3)',
    buttonPrimaryHover: '0 6px 24px rgba(29, 78, 216, 0.4)',
    sectionLight: '0 4px 16px rgba(29, 78, 216, 0.08)',
    sectionDark: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },

  // Additional overlays for components
  componentOverlays: {
    heroDark: 'rgba(30, 41, 59, 0.4)',
    heroLight: 'rgba(248, 250, 252, 0.6)',
    accentBlueDark: 'rgba(29, 78, 216, 0.2)',
    accentBlueLight: 'rgba(29, 78, 216, 0.1)',
    accentTealDark: 'rgba(13, 148, 136, 0.2)',
    accentTealLight: 'rgba(13, 148, 136, 0.1)',
    accentRedDark: 'rgba(239, 68, 68, 0.2)',
    accentRedLight: 'rgba(239, 68, 68, 0.1)',
  },
} as const;

// Extend MUI theme types to include customColors
declare module '@mui/material/styles' {
  interface Palette {
    customColors: typeof customColors;
  }
  interface PaletteOptions {
    customColors?: typeof customColors;
  }
}

// Shared typography configuration with modern font stack
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontWeight: 800,
    fontSize: 'clamp(2rem, 5vw, 3.75rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  h2: {
    fontWeight: 800,
    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontWeight: 700,
    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontWeight: 700,
    fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontWeight: 600,
    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
    lineHeight: 1.4,
  },
  body1: {
    fontSize: 'clamp(0.9375rem, 1.2vw, 1.0625rem)',
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: 'clamp(0.875rem, 1.1vw, 0.9375rem)',
    lineHeight: 1.65,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: 'clamp(0.9375rem, 1.2vw, 1rem)',
    letterSpacing: '0.02em',
  },
};

// Shared component styles with modern enhancements
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        padding: '12px 28px',
        fontSize: '1rem',
        fontWeight: 600,
        boxShadow: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        minHeight: '44px',
        '@media (max-width: 600px)': {
          padding: '10px 20px',
          fontSize: '0.9375rem',
          minHeight: '48px',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s',
        },
        '&:hover::before': {
          transform: 'translateX(100%)',
        },
        '&:hover': {
          boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
      },
      contained: {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
          backgroundColor: 'rgba(29, 78, 216, 0.08)',
        },
      },
      sizeSmall: {
        padding: '8px 20px',
        fontSize: '0.875rem',
        minHeight: '40px',
      },
      sizeLarge: {
        padding: '14px 32px',
        fontSize: '1.125rem',
        minHeight: '52px',
        '@media (max-width: 600px)': {
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(29, 78, 216, 0.1)',
        overflow: 'hidden' as const,
        position: 'relative' as const,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      elevation2: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      elevation3: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
      filled: {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)',
        color: '#ffffff',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 14,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: 'rgba(29, 78, 216, 0.5)',
            },
          },
          '&.Mui-focused': {
            '& input': {
              backgroundColor: 'transparent !important',
            },
            '& textarea': {
              backgroundColor: 'transparent !important',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              boxShadow: '0 0 0 4px rgba(29, 78, 216, 0.1)',
            },
          },
          '& input': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
          '& textarea': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px transparent inset !important',
            WebkitTextFillColor: 'inherit !important',
            transition: 'background-color 5000s ease-in-out 0s',
          },
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        border: '3px solid',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'rotate(15deg) scale(1.1)',
          backgroundColor: 'rgba(29, 78, 216, 0.1)',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 10,
        fontSize: '0.875rem',
        padding: '8px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
      },
    },
  },
};

// Light mode theme with enhanced colors and gradients
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...colors,
    background: {
      default: customColors.bgLight.primary,
      paper: customColors.bgLight.paper,
    },
    text: {
      primary: customColors.textLight.primary,
      secondary: customColors.textLight.secondary,
    },
    divider: customColors.borders.primaryLight,
    // Add custom colors to palette for easy access
    customColors,
  } as any,
  typography,
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 1px 0 rgba(29, 78, 216, 0.12)',
          borderBottom: '1px solid rgba(29, 78, 216, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(29, 78, 216, 0.1)',
          border: '1px solid rgba(29, 78, 216, 0.12)',
          overflow: 'hidden' as const,
          position: 'relative' as const,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        },
      },
    },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.10)',
    '0 12px 24px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.14)',
    '0 20px 40px rgba(0,0,0,0.16)',
    '0 24px 48px rgba(0,0,0,0.18)',
    '0 28px 56px rgba(0,0,0,0.20)',
    '0 32px 64px rgba(0,0,0,0.22)',
    '0 36px 72px rgba(0,0,0,0.24)',
    '0 40px 80px rgba(0,0,0,0.26)',
    '0 44px 88px rgba(0,0,0,0.28)',
    '0 48px 96px rgba(0,0,0,0.30)',
    '0 52px 104px rgba(0,0,0,0.32)',
    '0 56px 112px rgba(0,0,0,0.34)',
    '0 60px 120px rgba(0,0,0,0.36)',
    '0 64px 128px rgba(0,0,0,0.38)',
    '0 68px 136px rgba(0,0,0,0.40)',
    '0 72px 144px rgba(0,0,0,0.42)',
    '0 76px 152px rgba(0,0,0,0.44)',
    '0 80px 160px rgba(0,0,0,0.46)',
    '0 84px 168px rgba(0,0,0,0.48)',
    '0 88px 176px rgba(0,0,0,0.50)',
    '0 92px 184px rgba(0,0,0,0.52)',
  ],
});

// Dark mode theme with rich gradients and enhanced visuals
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
    background: {
      default: customColors.bgDark.primary,
      paper: customColors.bgDark.paper,
    },
    text: {
      primary: customColors.textDark.primary,
      secondary: customColors.textDark.secondary,
    },
    divider: customColors.borders.primaryDark,
    // Add custom colors to palette for easy access
    customColors,
  } as any,
  typography,
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(19, 24, 39, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 1px 0 rgba(29, 78, 216, 0.25)',
          borderBottom: '1px solid rgba(29, 78, 216, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(29, 78, 216, 0.2)',
          overflow: 'hidden' as const,
          position: 'relative' as const,
          background: 'linear-gradient(135deg, #131827 0%, #1e293b 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: '#131827',
          border: '1px solid rgba(29, 78, 216, 0.1)',
        },
      },
    },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.3)',
    '0 4px 8px rgba(0,0,0,0.35)',
    '0 8px 16px rgba(0,0,0,0.40)',
    '0 12px 24px rgba(0,0,0,0.45)',
    '0 16px 32px rgba(0,0,0,0.50)',
    '0 20px 40px rgba(0,0,0,0.55)',
    '0 24px 48px rgba(0,0,0,0.60)',
    '0 28px 56px rgba(0,0,0,0.65)',
    '0 32px 64px rgba(0,0,0,0.70)',
    '0 36px 72px rgba(0,0,0,0.75)',
    '0 40px 80px rgba(0,0,0,0.80)',
    '0 44px 88px rgba(0,0,0,0.82)',
    '0 48px 96px rgba(0,0,0,0.84)',
    '0 52px 104px rgba(0,0,0,0.86)',
    '0 56px 112px rgba(0,0,0,0.88)',
    '0 60px 120px rgba(0,0,0,0.90)',
    '0 64px 128px rgba(0,0,0,0.92)',
    '0 68px 136px rgba(0,0,0,0.94)',
    '0 72px 144px rgba(0,0,0,0.96)',
    '0 76px 152px rgba(0,0,0,0.98)',
    '0 80px 160px rgba(0,0,0,1.00)',
    '0 84px 168px rgba(0,0,0,1.00)',
    '0 88px 176px rgba(0,0,0,1.00)',
    '0 92px 184px rgba(0,0,0,1.00)',
  ],
});

export { lightTheme, darkTheme };
