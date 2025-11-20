import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Typography, Container, Paper, Divider, useTheme } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function AboutUs() {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 }, flex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 2,
              color: 'text.primary',
            }}
          >
            About Us
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 4,
              background: theme.palette.customColors.gradients.primary,
              mx: 'auto',
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Intro Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            mb: 6,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background:
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.componentOverlays.heroDark
                : theme.palette.customColors.componentOverlays.heroLight,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 600,
              mb: 3,
              color: 'text.primary',
            }}
          >
            Transforming Content Creation
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.9,
              color: 'text.secondary',
              mb: 2,
            }}
          >
            Welcome to AutoBlog, where innovation meets creativity. We're building the future of content creation by
            combining powerful AI technology with intuitive design, making it easier than ever to share your ideas with
            the world.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.9,
              color: 'text.secondary',
            }}
          >
            Our platform empowers writers, marketers, and creators to produce high-quality content efficiently, giving
            you more time to focus on what matters most—connecting with your audience.
          </Typography>
        </Paper>

        {/* Mission, Vision, Values */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Mission */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background:
                    theme.palette.mode === 'dark'
                      ? theme.palette.customColors.componentOverlays.accentBlueDark
                      : theme.palette.customColors.componentOverlays.accentBlueLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RocketLaunchIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Our Mission
              </Typography>
            </Box>
            <Box sx={{ pl: { xs: 0, sm: 8 } }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.9,
                  color: 'text.secondary',
                }}
              >
                To democratize content creation by providing accessible, intelligent tools that help anyone transform
                their ideas into engaging stories. We believe every voice deserves to be heard, and we're here to make
                that happen.
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Vision */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background:
                    theme.palette.mode === 'dark'
                      ? theme.palette.customColors.componentOverlays.accentTealDark
                      : theme.palette.customColors.componentOverlays.accentTealLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VisibilityIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Our Vision
              </Typography>
            </Box>
            <Box sx={{ pl: { xs: 0, sm: 8 } }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.9,
                  color: 'text.secondary',
                }}
              >
                To be the world's most trusted platform for AI-assisted content creation, where technology enhances
                human creativity without replacing it. We envision a future where quality content is accessible to all,
                and the barriers to publishing are a thing of the past.
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Values */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background:
                    theme.palette.mode === 'dark'
                      ? theme.palette.customColors.componentOverlays.accentRedDark
                      : theme.palette.customColors.componentOverlays.accentRedLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FavoriteIcon sx={{ color: 'error.main', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Our Values
              </Typography>
            </Box>
            <Box sx={{ pl: { xs: 0, sm: 8 } }}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                <strong style={{ color: 'inherit', fontWeight: 600 }}>Innovation:</strong> We constantly push the
                boundaries of what's possible with AI and content creation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                <strong style={{ color: 'inherit', fontWeight: 600 }}>Quality:</strong> Every feature we build is
                designed with excellence and user experience in mind.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.9,
                  color: 'text.secondary',
                }}
              >
                <strong style={{ color: 'inherit', fontWeight: 600 }}>Community:</strong> We're building more than a
                platform—we're cultivating a community of creators who inspire and support each other.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Closing Statement */}
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            p: { xs: 4, md: 6 },
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            background:
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.overlay.black.light
                : theme.palette.customColors.overlay.black.light,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            Join us on this journey
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Whether you're a seasoned blogger or just starting out, we're here to help you succeed. Let's create
            something amazing together.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
