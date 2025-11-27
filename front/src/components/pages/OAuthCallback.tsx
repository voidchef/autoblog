import { FC, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch } from '../../utils/reduxHooks';
import { setTokens } from '../../reducers/auth';
import { showSuccess, showError } from '../../reducers/alert';
import { ROUTES } from '../../utils/routing/routes';

const OAuthCallback: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const error = searchParams.get('error');

    if (error) {
      dispatch(showError('Authentication failed. Please try again.'));
      navigate(ROUTES.LOGIN);
      return;
    }

    if (token && refreshToken && userId) {
      // Store tokens
      const tokens = {
        access: {
          token,
          expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        },
        refresh: {
          token: refreshToken,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      };

      dispatch(setTokens({ tokens, userId }));
      dispatch(showSuccess('Successfully signed in!'));
      navigate(ROUTES.ROOT);
    } else {
      dispatch(showError('Invalid authentication response.'));
      navigate(ROUTES.LOGIN);
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;
