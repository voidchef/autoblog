import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

const Headline = () => {
  const navigate = useNavigate();
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      textAlign={{ xs: 'center', sm: 'left' }}
    >
      <Typography
        component="div"
        fontSize={{ xs: '2rem', sm: '3rem' }}
        fontWeight={450}
        sx={{ marginBottom: '1rem' }}
        color={'primary'}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget tristique velit.
      </Typography>
      <Typography component="div" sx={{ marginBottom: '1rem' }}>
        By <span style={{ color: '#555FAC' }}>Admin</span> | May 23, 2023
      </Typography>
      <Typography fontSize={{ xs: '1rem', sm: '1.2rem' }} component="div" color={'#6D6E76'} sx={{ marginBottom: '1rem' }}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
        <br />
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
      </Typography>
      <Button variant="contained" sx={{ width: 'fit-content', mx: { xs: 'auto', sm: 0 } }} onClick={() => navigate(ROUTES.ABOUTUS)}>
        Read More {'>'}
      </Button>
    </Box>
  );
};

export default Headline;
