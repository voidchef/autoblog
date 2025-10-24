import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import Typography from '@mui/material/Typography';
import { useLoginMutation, useRegisterMutation } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/routing/routes';
import { useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../reducers/alert';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

export default function SignInSide() {
  const [signUp, setSignUp] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation();
  const [register, { isLoading: registerLoading, error: registerError }] = useRegisterMutation();

  // Common TextField styles to prevent highlight issues
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
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
      '&.Mui-focused': {
        '& input': {
          backgroundColor: 'transparent !important',
        },
        '& textarea': {
          backgroundColor: 'transparent !important',
        },
      },
    },
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (signUp) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (signUp) {
        const result = await register({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }).unwrap();

        dispatch(showSuccess('Registration successful! Please check your email to verify your account.'));
        navigate(ROUTES.ROOT);
      } else {
        const result = await login({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }).unwrap();

        dispatch(showSuccess('Login successful! Welcome back!'));
        navigate(ROUTES.ROOT);
      }
    } catch (error: any) {
      // Error is already handled by the transformErrorResponse in authApi
      // But we can add additional error handling here if needed
      const errorMessage =
        typeof error === 'string' ? error : error?.message || (signUp ? 'Registration failed' : 'Login failed');
      dispatch(showError(errorMessage));
    }
  };

  const currentError = signUp ? registerError : loginError;
  const isLoading = signUp ? registerLoading : loginLoading;

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/v1/auth/google`;
  };

  const handleAppleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/v1/auth/apple`;
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
      <Grid
        size={{ xs: 0, sm: 4, md: 7 }}
        sx={{
          backgroundImage: 'url(https://picsum.photos/1920/1080?random)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Grid 
        size={{ xs: 12, sm: 8, md: 5 }} 
        component={Paper} 
        elevation={6} 
        square
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            my: { xs: 4, sm: 6, md: 8 },
            mx: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 48px)', md: 'calc(100% - 64px)' },
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 2, 
              mt: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            {signUp ? 'Create Account' : 'Sign In'}
          </Typography>

          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              fontSize: { xs: '0.875rem', sm: '0.95rem' }
            }}
          >
            {signUp 
              ? 'Create your account to get started' 
              : 'Welcome back! Please sign in to continue'}
          </Typography>

          {currentError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {typeof currentError === 'string' ? currentError : 'An error occurred'}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {signUp && (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      disabled={isLoading}
                      autoFocus
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      disabled={isLoading}
                      sx={textFieldStyles}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isLoading}
              autoFocus={!signUp}
              sx={textFieldStyles}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete={signUp ? 'new-password' : 'current-password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
              sx={textFieldStyles}
            />

            {signUp && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={isLoading}
                sx={textFieldStyles}
              />
            )}

            {!signUp && (
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    color="primary"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                sx={{ 
                  mt: 1,
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.875rem', sm: '0.95rem' }
                  }
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                }
              }}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? (signUp ? 'Creating Account...' : 'Signing In...') : signUp ? 'Create Account' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              startIcon={<GoogleIcon />}
              sx={{ 
                mb: 1.5, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleAppleSignIn}
              disabled={isLoading}
              startIcon={<AppleIcon />}
              sx={{ 
                mb: 2, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Continue with Apple
            </Button>

            <Grid container spacing={2} sx={{ mt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 'auto' }}>
                {!signUp && (
                  <Link 
                    href="#" 
                    variant="body2"
                    sx={{ 
                      display: 'block',
                      textAlign: { xs: 'center', sm: 'left' },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    Forgot password?
                  </Link>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 'grow' }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setSignUp(!signUp);
                    setFormErrors({});
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      rememberMe: false,
                    });
                  }}
                  disabled={isLoading}
                  sx={{ 
                    display: 'block',
                    textAlign: { xs: 'center', sm: 'right' },
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                    fontWeight: 500,
                    width: '100%',
                    mt: { xs: 1, sm: 0 }
                  }}
                >
                  {signUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
