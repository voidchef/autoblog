import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Create as CreateIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const Headline = () => {
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      textAlign={'center'}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginBottom: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 56, sm: 72 },
            height: { xs: 56, sm: 72 },
            borderRadius: '50%',
            background: (theme) => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
              : `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <CreateIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'white' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: (theme) => theme.palette.warning.main,
            boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.warning.main, 0.4)}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
        </Box>
      </Box>
      <Typography
        variant="h2"
        component="div"
        fontSize={{ xs: '2.5rem', sm: '3.5rem' }}
        fontWeight={800}
        sx={{ 
          marginBottom: '0.5rem',
          background: (theme) => theme.palette.mode === 'dark'
            ? theme.palette.customColors.gradients.textDarkAlt
            : theme.palette.customColors.gradients.textLightAlt,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: (theme) => theme.palette.mode === 'dark' 
            ? `0 0 40px ${theme.palette.customColors.shadows.primary}` 
            : 'none',
          letterSpacing: '-0.02em',
        }}
      >
        Create Amazing Content
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: (theme) => theme.palette.mode === 'dark'
            ? theme.palette.text.secondary
            : theme.palette.text.secondary,
          maxWidth: '600px',
          fontWeight: 400,
          opacity: 0.8,
        }}
      >
        Harness the power of AI to generate engaging blog posts in seconds
      </Typography>
    </Box>
  );
};

export default Headline;
