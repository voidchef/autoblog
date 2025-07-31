import * as React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { Warning as WarningIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

interface OpenAiKeyBannerProps {
  hasOpenAiKey: boolean;
}

const OpenAiKeyBanner: React.FC<OpenAiKeyBannerProps> = ({ hasOpenAiKey }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  if (hasOpenAiKey) {
    return null;
  }

  return (
    <Box sx={{ marginX: { xs: '1rem', sm: '7rem' }, marginBottom: 3 }}>
      <Alert
        severity="warning"
        icon={<WarningIcon fontSize="inherit" />}
        sx={{
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: 2,
          },
        }}
      >
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
            OpenAI API Key Required
          </Typography>
          <Typography variant="body2">
            You need to add your OpenAI API key to generate blog posts. Please add it in your profile settings.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SettingsIcon />}
          onClick={handleGoToProfile}
          sx={{
            minWidth: 'fit-content',
            whiteSpace: 'nowrap',
          }}
        >
          Go to Profile
        </Button>
      </Alert>
    </Box>
  );
};

export default OpenAiKeyBanner;
