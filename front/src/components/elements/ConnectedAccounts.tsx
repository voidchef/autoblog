import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Apple as AppleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useGetOAuthConnectionsQuery,
  useUnlinkOAuthConnectionMutation,
} from '../../services/authApi';
import OAuthLinkButtons from './OAuthLinkButtons';

const ConnectedAccounts: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useGetOAuthConnectionsQuery();
  const [unlinkConnection, { isLoading: isUnlinking }] = useUnlinkOAuthConnectionMutation();

  const handleUnlink = async (connectionId: string, provider: string) => {
    if (window.confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      try {
        await unlinkConnection(connectionId).unwrap();
      } catch (err) {
        console.error('Failed to unlink account:', err);
      }
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <GoogleIcon sx={{ fontSize: 40, color: theme.palette.customColors.oauth.google }} />;
      case 'apple':
        return <AppleIcon sx={{ fontSize: 40, color: theme.palette.customColors.oauth.apple }} />;
      default:
        return null;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      default:
        return provider;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load connected accounts. Please try again later.
      </Alert>
    );
  }

  if (!data || data.connections.length === 0) {
    return (
      <Alert severity="info">
        No OAuth accounts connected yet. Link your Google or Apple account to get started.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Connected Accounts
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Manage your linked OAuth accounts
      </Typography>

      <Stack spacing={2}>
        {data.connections.map((connection) => (
          <Card key={connection.id} variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  {getProviderIcon(connection.provider)}
                  <Box>
                    <Typography variant="h6">
                      {getProviderName(connection.provider)}
                    </Typography>
                    {connection.email && (
                      <Typography variant="body2" color="text.secondary">
                        {connection.email}
                      </Typography>
                    )}
                    <Box mt={1} display="flex" gap={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Connected: {new Date(connection.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Chip
                        label={connection.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={connection.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box display="flex" gap={1}>
                  <Tooltip title="Unlink account">
                    <IconButton
                      onClick={() => handleUnlink(connection.id, connection.provider)}
                      disabled={isUnlinking}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <OAuthLinkButtons />

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> You need at least one authentication method (password or OAuth account) 
          to access your account. If you want to remove all OAuth accounts, make sure you have a password set.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ConnectedAccounts;
