import React from 'react';
import { Box, Button, Stack, Typography, Alert, useTheme } from '@mui/material';
import { Google as GoogleIcon, Apple as AppleIcon } from '@mui/icons-material';
import { useGetOAuthConnectionsQuery } from '../../../services/authApi';

const OAuthLinkButtons: React.FC = () => {
  const { data, isLoading } = useGetOAuthConnectionsQuery();
  const theme = useTheme();

  const handleOAuthLink = (provider: 'google' | 'apple') => {
    const apiUrl = import.meta.env.VITE_SERVER_URL;
    const redirectUrl = `${apiUrl}/v1/auth/${provider}?link=true`;
    window.location.href = redirectUrl;
  };

  if (isLoading) {
    return null;
  }

  // Check which providers are connected
  const connections = data?.connections || [];
  const googleConnected = connections.some(conn => conn.provider === 'google');
  const appleConnected = connections.some(conn => conn.provider === 'apple');

  // If both are connected, don't show the buttons
  if (googleConnected && appleConnected) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        All available OAuth providers are already linked to your account.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Link Additional Accounts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connect your Google or Apple account for easier sign-in
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {!googleConnected && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthLink('google')}
            sx={{
              borderColor: theme.palette.customColors.oauth.google,
              color: theme.palette.customColors.oauth.google,
              textTransform: 'none',
              py: 1.5,
              '&:hover': {
                borderColor: theme.palette.customColors.oauth.googleHover,
                backgroundColor: theme.palette.customColors.oauth.googleBg,
              },
            }}
          >
            Link Google Account
          </Button>
        )}

        {!appleConnected && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AppleIcon />}
            onClick={() => handleOAuthLink('apple')}
            sx={{
              borderColor: theme.palette.customColors.oauth.apple,
              color: theme.palette.customColors.oauth.apple,
              textTransform: 'none',
              py: 1.5,
              '&:hover': {
                borderColor: theme.palette.customColors.oauth.appleHover,
                backgroundColor: theme.palette.customColors.oauth.appleBg,
              },
            }}
          >
            Link Apple Account
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OAuthLinkButtons;
