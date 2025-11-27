import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem, Typography, Container, Divider, Alert, CircularProgress, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import { useCreateContactMutation } from '../../services/contactApi';
import { useAppSelector, useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../reducers/alert';
import { useState, ChangeEvent, FormEvent } from 'react';

export default function ContactUs() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const queryTypes = useAppSelector((state) => state.appSettings.queryType || []);
  const [createContact, { isLoading, isSuccess, isError, error }] = useCreateContactMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    queryType: '',
    message: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    queryType: '',
    message: '',
  });
  
  // Handle input changes
  const handleChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      queryType: '',
      message: '',
    };
    
    let isValid = true;
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!formData.queryType) {
      newErrors.queryType = 'Please select a query type';
      isValid = false;
    }
    
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createContact(formData).unwrap();
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        queryType: '',
        message: '',
      });
      dispatch(showSuccess("Message sent successfully! We'll get back to you within 24 hours."));
    } catch (err) {
      console.error('Failed to send message:', err);
      dispatch(showError('Failed to send message. Please try again later.'));
    }
  };

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
              background: theme.palette.customColors.gradients.primary,
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
          <Grid size={{ xs: 12, md: 4 }}>
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
                        background:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.componentOverlays.accentBlueDark
                            : theme.palette.customColors.componentOverlays.accentBlueLight,
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
          <Grid size={{ xs: 12, md: 7 }}>
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

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Success/Error Alert */}
                {isError && (
                  <Alert severity="error" onClose={() => {}}>
                    {(error as any)?.data?.message || 'Failed to send message. Please try again.'}
                  </Alert>
                )}
                
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
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={isLoading}
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
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={isLoading}
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
                    value={formData.queryType}
                    onChange={handleChange('queryType')}
                    placeholder="Select query type"
                    variant="outlined"
                    size="medium"
                  >
                    {queryTypes.length === 0 ? (
                      <MenuItem disabled>No query types available</MenuItem>
                    ) : (
                      queryTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    )}
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
                    value={formData.message}
                    onChange={handleChange('message')}
                    error={!!errors.message}
                    helperText={errors.message}
                    disabled={isLoading}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    mt: 1,
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
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
