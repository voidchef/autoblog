import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../utils/routing/routes';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { FC, useState, useEffect } from 'react';

interface VerificationState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

const VerifyEmail: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'loading',
    message: '',
  });

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationState({
          status: 'error',
          message: 'Verification token is missing. Please check your email link.',
        });
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/v1/auth/verify-email?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setVerificationState({
            status: 'success',
            message: 'Your email has been successfully verified! You can now sign in to your account.',
          });
        } else {
          const errorData = await response.json();
          setVerificationState({
            status: 'error',
            message: errorData.message || 'Email verification failed. The link may be invalid or expired.',
          });
        }
      } catch (error) {
        setVerificationState({
          status: 'error',
          message: 'An error occurred while verifying your email. Please try again later.',
        });
      }
    };

    verifyEmailToken();
  }, [searchParams]);

  const handleNavigateToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleNavigateToHome = () => {
    navigate(ROUTES.ROOT);
  };

  return (
    <>
      <NavBar />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {verificationState.status === 'loading' && (
            <Box>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" component="h1" gutterBottom>
                Verifying Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we verify your email address...
              </Typography>
            </Box>
          )}

          {verificationState.status === 'success' && (
            <Box>
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {verificationState.message}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNavigateToLogin}
                  startIcon={<EmailIcon />}
                  sx={{ py: 1.5 }}
                >
                  Sign In to Your Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNavigateToHome}
                  sx={{ py: 1.5 }}
                >
                  Go to Home
                </Button>
              </Box>
            </Box>
          )}

          {verificationState.status === 'error' && (
            <Box>
              <ErrorIcon
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {verificationState.message}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                If you continue to experience issues, please contact support or try registering again.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNavigateToLogin}
                  sx={{ py: 1.5 }}
                >
                  Go to Sign In
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNavigateToHome}
                  sx={{ py: 1.5 }}
                >
                  Go to Home
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default VerifyEmail;
