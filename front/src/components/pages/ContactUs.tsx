import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Button, MenuItem, Typography } from '@mui/material';
import { useAppSelector } from '../../utils/reduxHooks';
import { IFieldData } from '../../reducers/appSettings';

export default function ContactUs() {
  const queries = useAppSelector((state) => state.appSettings.queryType);

  return (
    <Box>
      <NavBar />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        alignItems={'center'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        <Box maxWidth={{ sm: '35rem' }}>
          <Box textAlign={'center'} sx={{ gap: { sm: 1 } }}>
            <Typography component={'div'} fontSize={'2rem'} fontWeight={700}>
              Contact Us
            </Typography>
            <Typography component={'div'} fontSize={'3rem'}>
              Know Our Latest Updates!
            </Typography>
            <Typography component={'div'} fontSize={'1rem'}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim.
            </Typography>
          </Box>
          <Box sx={{ my: 2 }} />
          <Box component="form" display={'flex'} flexDirection={'column'} sx={{ gap: { xs: 2, sm: 3 } }}>
            <TextField required id="outlined-required" label="Full Name" placeholder="Full Name" />
            <TextField required id="outlined-required" label="Your Email" placeholder="Your Email" />
            <TextField
              required
              id="outlined-select-currency"
              select
              label="Select"
              defaultValue="EUR"
              helperText="Please select your query"
            >
              {queries.map((option: IFieldData) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField required id="outlined-multiline-static" label="Message" multiline rows={4} placeholder="Message" />
            <Button variant="contained" fullWidth>
              Send Message
            </Button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ my: 6 }} />
      <Footer />
    </Box>
  );
}
