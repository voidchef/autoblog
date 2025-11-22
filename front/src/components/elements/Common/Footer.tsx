import {
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { AutoAwesome, Email, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { useSubscribeNewsletterMutation } from '../../../services/newsletterApi';
import { showSuccess, showError } from '../../../reducers/alert';
import { useAppDispatch } from '../../../utils/reduxHooks';

const navItems = ['Home', 'Blog', 'About Us', 'Contact Us'];

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  function handleClick(item: string) {
    switch (item) {
      case 'Home':
        navigate(ROUTES.ROOT);
        break;
      case 'Blog':
        navigate(ROUTES.ALLPOSTS);
        break;
      case 'About Us':
        navigate(ROUTES.ABOUTUS);
        break;
      case 'Contact Us':
        navigate(ROUTES.CONTACTUS);
        break;
      default:
        break;
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubscribe = async () => {
    // Reset error
    setEmailError('');

    // Validate email
    if (!newsletterEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(newsletterEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await subscribeNewsletter({ email: newsletterEmail }).unwrap();
      dispatch(showSuccess('Successfully subscribed to newsletter! Check your email for confirmation.'));
      setNewsletterEmail('');
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to subscribe. Please try again.';
      dispatch(showError(errorMessage));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleNewsletterSubscribe();
    }
  };

  return (
    <Box
      sx={{
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.customColors.gradients.footerDark
            : theme.palette.customColors.gradients.footerLight,
        color: 'white',
        pt: 4,
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: (theme) =>
            `linear-gradient(90deg, transparent, ${theme.palette.customColors.overlay.white.stronger}, transparent)`,
        },
      }}
    >
      <Container maxWidth="lg">
        {/* Newsletter Section */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center" mb={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 1, md: 1.5 } }}>
              <Email
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Stay Updated!
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.95,
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                lineHeight: 1.6,
                mb: { xs: 2, md: 0 },
              }}
            >
              Subscribe to our newsletter and get the latest articles, updates, and exclusive content delivered straight to
              your inbox.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 1.5 },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                placeholder="Enter your email address"
                variant="outlined"
                fullWidth
                size="medium"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  setEmailError('');
                }}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
                disabled={isSubscribing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1.25rem',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                    borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    minHeight: { xs: '48px', sm: '52px', md: '56px' },
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: emailError ? 'error.main' : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: '2px',
                    },
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                      '& fieldset': {
                        borderColor: emailError ? 'error.main' : 'primary.main',
                      },
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                      '& fieldset': {
                        borderColor: emailError ? 'error.main' : 'primary.main',
                        borderWidth: '2px',
                      },
                    },
                    '& input': {
                      py: { xs: 1.25, sm: 1.5 },
                      color: '#0f172a',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(0, 0, 0, 0.6)',
                        opacity: 1,
                      },
                    },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                      WebkitBoxShadow: '0 0 0 100px rgba(255, 255, 255, 0.98) inset !important',
                      WebkitTextFillColor: '#0f172a !important',
                      caretColor: '#0f172a !important',
                      transition: 'background-color 5000s ease-in-out 0s !important',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#fff',
                    bgcolor: 'error.main',
                    margin: 0,
                    mt: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    fontSize: '0.813rem',
                    fontWeight: 500,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleNewsletterSubscribe}
                disabled={isSubscribing}
                startIcon={!isSubscribing && <Email />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  px: { xs: 3, sm: 3.5, md: 4 },
                  py: { xs: 1.5, sm: 1.75 },
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  border: 'none',
                  minHeight: { xs: '48px', sm: '52px', md: '56px' },
                  minWidth: { xs: '100%', sm: '140px' },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.5) 100%)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                {isSubscribing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Subscribe'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Main Footer Content */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesome sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
              <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                AUTOBLOG
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                opacity: 0.95,
                lineHeight: 1.8,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                pr: { md: 2 },
              }}
            >
              AI-powered content generation platform helping you create amazing blog posts with ease.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                sx={{
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.strong,
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.overlay.black.stronger}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.strong,
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.overlay.black.stronger}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.strong,
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.overlay.black.stronger}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.strong,
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.overlay.black.stronger}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {navItems.map((item) => (
                <Button
                  key={item}
                  sx={{
                    color: 'white',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 1.5,
                    opacity: 0.95,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                      transform: 'translateX(8px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onClick={() => handleClick(item)}
                >
                  → {item}
                </Button>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              Contact Us
            </Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                    flexShrink: 0,
                  }}
                >
                  <Phone fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8125rem', mb: 0.5 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.9375rem' }}>
                    020 7993 2905
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.customColors.overlay.white.medium,
                    flexShrink: 0,
                  }}
                >
                  <Email fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8125rem', mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.9375rem' }}>
                    hello@autoblog.com
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Divider sx={{ borderColor: (theme) => theme.palette.customColors.overlay.white.medium, my: 4 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            }}
          >
            © {new Date().getFullYear()} AutoBlog. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }}>
            <Button
              sx={{
                color: 'white',
                opacity: 0.9,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                px: 1,
                '&:hover': {
                  opacity: 1,
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.light,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Privacy Policy
            </Button>
            <Button
              sx={{
                color: 'white',
                opacity: 0.9,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                px: 1,
                '&:hover': {
                  opacity: 1,
                  bgcolor: (theme) => theme.palette.customColors.overlay.white.light,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Terms of Service
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
