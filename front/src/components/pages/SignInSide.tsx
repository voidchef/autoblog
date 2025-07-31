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
import Typography from '@mui/material/Typography';
import { useLoginMutation, useRegisterMutation } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/routing/routes';
import { useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../actions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function SignInSide() {
  const [signUp, setSignUp] = React.useState(true);
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

        dispatch(showSuccess('Registration successful! Welcome to AutoBlog!'));
        navigate(ROUTES.ROOT);
      } else {
        const result = await login({
          email: formData.email,
          password: formData.password,
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

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        size={{ xs: 0, sm: 4, md: 7 }}
        sx={{
          backgroundImage: 'url(/hero.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid size={{ xs: 12, sm: 8, md: 5 }} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            {signUp ? 'Create Account' : 'Sign In'}
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
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? (signUp ? 'Creating Account...' : 'Signing In...') : signUp ? 'Create Account' : 'Sign In'}
            </Button>

            <Grid container spacing={2}>
              <Grid size={{ xs: 'auto' }}>
                {!signUp && (
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                )}
              </Grid>
              <Grid>
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
