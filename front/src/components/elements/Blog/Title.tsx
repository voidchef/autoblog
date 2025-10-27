import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Headline = ({ title }: { title: String }) => {
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      sx={{ marginX: { xs: '1rem', sm: '7rem' }, marginTop: '2rem' }}
      textAlign={'center'}
    >
      <Typography
        variant="h2"
        component="div"
        fontSize={{ xs: '2rem', sm: '3rem' }}
        fontWeight={700}
        sx={{ 
          marginBottom: '1rem',
          background: (theme) => theme.palette.mode === 'dark'
            ? theme.palette.customColors.gradients.textDarkAlt
            : theme.palette.customColors.gradients.textLightAlt,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: (theme) => theme.palette.mode === 'dark' 
            ? `0 0 40px ${theme.palette.customColors.shadows.primary}` 
            : 'none',
        }}
      >
        {title}
      </Typography>
      <Typography component="div" sx={{ marginBottom: '1rem' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
      </Typography>
      <Typography 
        fontSize={{ xs: '1rem', sm: '1.5rem' }} 
        component="div" 
        sx={{ 
          marginBottom: '1rem',
          color: (theme) => theme.palette.customColors.neutral.gray.text,
        }}
      >
        Blog {'>'} {title}
      </Typography>
    </Box>
  );
};

export default Headline;
