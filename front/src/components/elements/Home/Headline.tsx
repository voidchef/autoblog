import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { AutoAwesome, TrendingUp, Speed } from '@mui/icons-material';

const Headline = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.customColors.gradients.heroDark
            : theme.palette.customColors.gradients.heroLight,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `radial-gradient(circle at 20% 50%, ${theme.palette.customColors.accent.blue.main}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${theme.palette.customColors.accent.teal.main}1a 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 50%, ${theme.palette.customColors.accent.blue.main}14 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${theme.palette.customColors.accent.teal.main}0f 0%, transparent 50%)`,
          opacity: 1,
        },
      }}
    >
      {/* Enhanced animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: '250px', md: '500px' },
          height: { xs: '250px', md: '500px' },
          background: (theme) => `radial-gradient(circle, ${theme.palette.customColors.accent.blue.main}2e 0%, ${theme.palette.customColors.accent.teal.main}1f 40%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '0%',
          width: { xs: '200px', md: '400px' },
          height: { xs: '200px', md: '400px' },
          background: (theme) => `radial-gradient(circle, ${theme.palette.customColors.accent.teal.main}2e 0%, ${theme.palette.customColors.accent.blue.main}1f 40%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: { xs: '300px', md: '600px' },
          height: { xs: '300px', md: '600px' },
          background: (theme) => `radial-gradient(circle, ${theme.palette.customColors.accent.blue.light}1a 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 12s ease-in-out infinite reverse',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <Container maxWidth="lg">
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={{ xs: 'center', md: 'flex-start' }}
          textAlign={{ xs: 'center', md: 'left' }}
          sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 3 } }}
        >
          {/* Enhanced Badge with animation */}
          <Box
            className="animate-fade-in-up"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: { xs: 1, md: 1.5 },
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.5 },
              mb: { xs: 3, md: 4 },
              borderRadius: 50,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.customColors.gradients.badgeDark
                  : theme.palette.customColors.gradients.badgeLight,
              border: '2px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.customColors.borders.primaryDarkHover : theme.palette.customColors.borders.primaryLightHover),
              backdropFilter: 'blur(10px)',
              boxShadow: (theme) => `0 4px 24px ${theme.palette.customColors.shadows.primaryLight}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: (theme) => `0 8px 32px ${theme.palette.customColors.shadows.primary}`,
              },
            }}
          >
            <Box
              sx={{
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <AutoAwesome sx={{ fontSize: { xs: '1rem', md: '1.3rem' }, color: 'primary.main' }} />
            </Box>
            <Typography
              variant="body2"
              className="gradient-text"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.8rem', md: '0.95rem' },
                letterSpacing: '0.05em',
              }}
            >
              AI-Powered Content Generation
            </Typography>
          </Box>

          {/* Enhanced Main Headline */}
          <Typography
            component="h1"
            className="animate-fade-in-up"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem', lg: '5.5rem' },
              fontWeight: 900,
              lineHeight: { xs: 1.15, md: 1.05 },
              mb: { xs: 2, md: 3 },
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.customColors.gradients.textDark
                  : theme.palette.customColors.gradients.textLight,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              maxWidth: '1000px',
              textShadow: (theme) => (theme.palette.mode === 'dark' ? `0 0 80px ${theme.palette.customColors.shadows.primary}` : 'none'),
              letterSpacing: '-0.03em',
            }}
          >
            Create Amazing Blog Content with AI
          </Typography>

          {/* Enhanced Subtitle */}
          <Typography
            variant="h6"
            component="p"
            className="animate-fade-in-up"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.35rem' },
              color: 'text.secondary',
              mb: { xs: 3, md: 5 },
              maxWidth: '750px',
              lineHeight: { xs: 1.6, md: 1.8 },
              fontWeight: 400,
              opacity: 0.95,
            }}
          >
            Transform your ideas into high-quality, SEO-optimized blog posts in seconds. Powered by advanced AI technology
            for professional content creation.
          </Typography>

          {/* Enhanced Feature Pills */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: { xs: 4, md: 6 } }} className="animate-fade-in-up">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 1.5 },
                px: { xs: 2.5, md: 3 },
                py: { xs: 0.75, md: 1 },
                borderRadius: 4,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.customColors.gradients.successDark
                    : theme.palette.customColors.gradients.successLight,
                border: '2px solid',
                borderColor: 'success.main',
                boxShadow: (theme) => `0 8px 24px ${theme.palette.customColors.shadows.success}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 12px 32px ${theme.palette.customColors.shadows.success}`,
                },
              }}
            >
              <Speed sx={{ color: 'success.main', fontSize: { xs: '1.5rem', md: '1.8rem' } }} />
              <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Lightning Fast
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 1.5 },
                px: { xs: 2.5, md: 3 },
                py: { xs: 0.75, md: 1 },
                borderRadius: 4,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.customColors.gradients.primaryPillDark
                    : theme.palette.customColors.gradients.primaryPillLight,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: (theme) => `0 8px 24px ${theme.palette.customColors.shadows.primaryLight}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 12px 32px ${theme.palette.customColors.shadows.primary}`,
                },
              }}
            >
              <TrendingUp sx={{ color: 'primary.main', fontSize: { xs: '1.5rem', md: '1.8rem' } }} />
              <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                SEO Optimized
              </Typography>
            </Box>
          </Stack>

          {/* Enhanced CTA Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} className="animate-fade-in-up">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.ALLPOSTS)}
              sx={{
                px: { xs: 4, md: 5 },
                py: { xs: 0.75, md: 1 },
                fontSize: { xs: '1rem', md: '1.15rem' },
                fontWeight: 700,
                borderRadius: 4,
                background: (theme) => theme.palette.customColors.gradients.primary,
                boxShadow: (theme) => `0 12px 32px ${theme.palette.customColors.shadows.primaryHeavy}`,
                position: 'relative',
                overflow: 'hidden',
                minHeight: '48px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: (theme) => theme.palette.customColors.gradients.primaryDark,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => `0 16px 48px ${theme.palette.customColors.shadows.primaryHeavy}`,
                  '&::before': {
                    opacity: 1,
                  },
                },
                '& span': {
                  position: 'relative',
                  zIndex: 1,
                },
              }}
            >
              Explore Blogs
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(ROUTES.ABOUTUS)}
              sx={{
                px: { xs: 4, md: 5 },
                py: { xs: 0.75, md: 1 },
                fontSize: { xs: '1rem', md: '1.15rem' },
                fontWeight: 700,
                borderRadius: 4,
                borderWidth: 3,
                borderColor: 'primary.main',
                color: 'primary.main',
                minHeight: '48px',
                background: (theme) =>
                  theme.palette.mode === 'dark' ? `${theme.palette.customColors.accent.blue.main}1a` : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderWidth: 3,
                  transform: 'translateY(-4px)',
                  background: 'primary.main',
                  color: 'white',
                  boxShadow: (theme) => `0 12px 32px ${theme.palette.customColors.shadows.primary}`,
                },
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Headline;
