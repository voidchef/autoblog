import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Posts from '../elements/AllPosts/Posts';
import Footer from '../elements/Common/Footer';
import Title from '../elements/Common/Title';
import { useLocation } from 'react-router-dom';

export default function Category() {
  const { state } = useLocation();
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
        <Title title={state && state.title ? state.title : 'All Posts'} />
      </Box>
      <Box sx={{ my: 4 }} />
      <Posts />
      <Footer />
    </Box>
  );
}
