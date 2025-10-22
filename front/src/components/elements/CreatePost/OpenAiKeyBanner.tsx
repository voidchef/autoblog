import * as React from 'react';
import { Alert, Button, Box, Typography, Paper } from '@mui/material';
import { 
  Warning as WarningIcon, 
  Settings as SettingsIcon,
  KeyOutlined as KeyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { alpha, keyframes } from '@mui/material/styles';

interface OpenAiKeyBannerProps {
  hasOpenAiKey: boolean;
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)})`,
          border: (theme) => `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: (theme) => `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
            animation: `${pulse} 2s ease-in-out infinite`,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: '250px' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                background: (theme) => alpha(theme.palette.warning.main, 0.15),
                border: (theme) => `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            >
              <KeyIcon sx={{ fontSize: 32, color: 'warning.main' }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  API Key Required
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                To unlock the power of AI-generated content, you need to add your OpenAI API key. 
                Don't have one? Get it from{' '}
                <Typography
                  component="a"
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  OpenAI's platform
                </Typography>
                .
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<SettingsIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={handleGoToProfile}
            sx={{
              minWidth: 'fit-content',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.warning.main, 0.3)}`,
              '&:hover': {
                boxShadow: (theme) => `0 6px 30px ${alpha(theme.palette.warning.main, 0.4)}`,
              },
            }}
          >
            Add API Key
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OpenAiKeyBanner;
