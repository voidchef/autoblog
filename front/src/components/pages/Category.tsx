import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Posts from '../elements/Category/Posts';
import Footer from '../elements/Common/Footer';
import Title from '../elements/Category/Title';

export default function Category() {
  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ gap: { xs: 2, sm: 5 } }}
        bgcolor={'#E9EAF4'}
      >
        <NavBar />
        <Title />
      </Box>
      <Box sx={{ my: 4 }} />
      <Posts />
      <Footer />
    </Box>
  );
}
