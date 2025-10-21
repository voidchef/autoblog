import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Posts from '../elements/AllPosts/Posts';
import Footer from '../elements/Common/Footer';
import Title from '../elements/AllPosts/Title';

export default function Category() {
  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ 
          gap: { xs: 2, sm: 5 },
          bgcolor: (theme) => theme.palette.mode === 'dark' 
            ? theme.palette.background.default
            : theme.palette.customColors.pageBackground.light,
        }}
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
