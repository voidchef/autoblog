import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Headline from '../elements/Home/Headline';
import Categories from '../elements/Home/Categories';
import FeaturedPost from '../elements/Home/FeaturedPost';
import RecentPosts from '../elements/Home/RecentPosts';
import Footer from '../elements/Common/Footer';
import { useGetBlogsQuery } from '../../services/blogApi';

export default function Home() {
  // Fetch featured blogs
  const { data: featuredBlogs } = useGetBlogsQuery({ 
    limit: 6, 
    isFeatured: true, 
    isPublished: true 
  });

  // Fetch recent blogs
  const { data: recentBlogs } = useGetBlogsQuery({ 
    limit: 4, 
    isPublished: true, 
    isFeatured: false, 
    sortBy: 'createdAt' 
  });

  return (
    <Box>
      <Box>
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
      <Box sx={{ my: 8 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        {featuredBlogs?.results && featuredBlogs.results.length > 0 && <FeaturedPost featuredBlogs={featuredBlogs.results} />}
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        {recentBlogs?.results && recentBlogs.results.length > 0 && <RecentPosts recentBlogs={recentBlogs.results} />}
      </Box>
      <Box sx={{ my: 4 }} />
      <Footer />
    </Box>
  );
}
