import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Headline from '../elements/Home/Headline';
import Categories from '../elements/Home/Categories';
import FeaturedPost from '../elements/Home/FeaturedPost';
import RecentPosts from '../elements/Home/RecentPosts';
import Footer from '../elements/Common/Footer';

export default function Home() {
  return (
    <Box>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} sx={{ gap: { xs: 2, sm: 5 } }}>
        <NavBar />
        <Headline />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        <Categories />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        <FeaturedPost />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        <RecentPosts />
      </Box>
      <Box sx={{ my: 4 }} />
      <Footer />
    </Box>
  );
}
