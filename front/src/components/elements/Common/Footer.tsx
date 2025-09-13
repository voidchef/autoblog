import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

const navItems = ['Home', 'Blog', 'About Us', 'Contact Us'];

const Footer = () => {
  const navigate = useNavigate();

  function handleClick(item: string) {
    switch (item) {
      case 'Home':
        navigate(ROUTES.ROOT);
        break;
      case 'Blog':
        navigate(ROUTES.ALLPOSTS);
        break;
      case 'About Us':
        navigate(ROUTES.ABOUTUS);
        break;
      case 'Contact Us':
        navigate(ROUTES.CONTACTUS);
        break;
      default:
        break;
    }
  }
  return (
    <Box bgcolor={'#555FAC'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
      <Box sx={{ marginX: { xs: '1rem', sm: '7rem' } }}>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={{ xs: 'center', sm: 'flex-end' }}
          sx={{ gap: { xs: 2, sm: 2 } }}
          marginY={3}
        >
          {navItems.map((item) => (
            <Button
              key={item}
              sx={{ color: 'white', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
              onClick={() => handleClick(item)}
            >
              {item}
            </Button>
          ))}
        </Box>
        <Grid container alignItems="center" marginY={3} spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              fontSize={{ xs: '1.5rem', sm: '2.25rem' }}
              sx={{ color: 'white' }}
              textAlign={{ xs: 'center', sm: 'start' }}
            >
              Subscribe to our newsletter to get the latest updates and news.
            </Typography>
          </Grid>
          <Grid container size={{ xs: 12, sm: 5 }} spacing={2} alignItems="center">
            <Grid size={8} display={'flex'} justifyContent={'center'} alignItems={'center'}>
              <TextField label="Enter Your Email" variant="outlined" fullWidth inputProps={{ style: { color: 'white' } }} />
            </Grid>
            <Grid size={4} sx={{ height: '100%' }}>
              <Button variant="contained" color="primary" fullWidth sx={{ height: '100%' }}>
                Subscribe
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Box textAlign={{ xs: 'center', sm: 'start' }}>
          <Typography variant="body1" color={'white'}>
            Contact Us
          </Typography>
          <Divider light={true} sx={{ marginY: 3 }} />
          <Typography variant="body1" color={'white'} fontSize={'1.25rem'} fontWeight={700}>
            020 7993 2905
          </Typography>
          <Typography variant="body1" color={'white'}>
            hello@autoblog.com
          </Typography>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={{ xs: 'center', sm: 'flex-end' }}
          sx={{ gap: 2 }}
          marginY={3}
        >
          <FacebookIcon sx={{ color: 'white', cursor: 'pointer' }} />
          <TwitterIcon sx={{ color: 'white', cursor: 'pointer' }} />
          <InstagramIcon sx={{ color: 'white', cursor: 'pointer' }} />
          <LinkedInIcon sx={{ color: 'white', cursor: 'pointer' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
