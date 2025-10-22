import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem, Typography, Container, Grid, Paper, Divider } from '@mui/material';
import { useAppSelector } from '../../utils/reduxHooks';
import { IFieldData } from '../../reducers/appSettings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

export default function ContactUs() {
  const queries = useAppSelector((state) => state.appSettings.queryType);

  const contactInfo = [
    {
      icon: <EmailIcon />,
      title: 'Email',
      primary: 'support@autoblog.com',
      secondary: 'Response within 24 hours',
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone',
      primary: '+1 (555) 123-4567',
      secondary: 'Mon-Fri, 8am-6pm PST',
    },
    {
      icon: <LocationOnIcon />,
      title: 'Location',
      primary: '123 Business Street',
      secondary: 'San Francisco, CA 94107',
    },
  ];

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
            Contact Us
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 4,
              background: 'linear-gradient(90deg, #1d4ed8 0%, #0d9488 100%)',
              mx: 'auto',
              borderRadius: 2,
              mb: 3,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Have questions or feedback? We're here to help. Reach out to us and we'll get back to you as soon as
            possible.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 600,
                  mb: 3,
                  color: 'text.primary',
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  mb: 4,
                }}
              >
                Whether you have a question about features, pricing, need support, or anything else, our team is ready
                to answer all your questions.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactInfo.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(29, 78, 216, 0.2)'
                            : 'rgba(29, 78, 216, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'primary.main',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                          mb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.25,
                        }}
                      >
                        {item.primary}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                        }}
                      >
                        {item.secondary}
                      </Typography>
                    </Box>
                  </Box>
                  {index < contactInfo.length - 1 && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                Send us a message
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '1rem',
                  color: 'text.secondary',
                  mb: 4,
                }}
              >
                Fill out the form and our team will get back to you within 24 hours
              </Typography>

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Full Name *
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="Enter your full name"
                    variant="outlined"
                    size="medium"
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Email Address *
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    placeholder="Enter your email address"
                    variant="outlined"
                    size="medium"
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Query Type *
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    select
                    defaultValue=""
                    placeholder="Select query type"
                    variant="outlined"
                    size="medium"
                  >
                    {queries.map((option: IFieldData) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Message *
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    variant="outlined"
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    mt: 1,
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
