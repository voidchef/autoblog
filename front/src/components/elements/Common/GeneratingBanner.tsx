import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

interface GeneratingBannerProps {
  blogId: string;
  blogTitle?: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export default function GeneratingBanner({
  blogId,
  blogTitle = 'Your blog',
  status,
  error,
}: GeneratingBannerProps) {
  const navigate = useNavigate();

  const handleViewBlog = () => {
    navigate(`${ROUTES.PREVIEW}/${blogId}?preview=true`);
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'failed':
        return 'error.main';
      default:
        return 'primary.main';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'white' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'white' }} />;
      default:
        return <AutoAwesomeIcon sx={{ color: 'white' }} />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'completed':
        return 'Blog Generated Successfully!';
      case 'failed':
        return 'Blog Generation Failed';
      default:
        return 'Generating Your Blog...';
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'completed':
        return 'Your blog is ready to preview.';
      case 'failed':
        return error || 'An error occurred during blog generation. Please try again.';
      default:
        return 'Please wait while we generate your blog content and images...';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: getBackgroundColor(),
        color: 'white',
        py: 2,
        px: 3,
        boxShadow: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getIcon()}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
            {getTitle()}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {getMessage()}
          </Typography>

          {blogTitle && blogTitle !== 'Generating...' && blogTitle !== 'Generating from template...' && (
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={blogTitle}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  maxWidth: '300px',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Action/Progress */}
        <Box sx={{ minWidth: { xs: '100%', sm: '200px' } }}>
          {status === 'processing' && (
            <Box>
              <LinearProgress
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: 'block', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}
              >
                Processing...
              </Typography>
            </Box>
          )}

          {status === 'completed' && (
            <Typography
              variant="body2"
              component="span"
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 600,
                display: 'block',
                textAlign: 'center',
              }}
              onClick={handleViewBlog}
            >
              View Blog →
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
