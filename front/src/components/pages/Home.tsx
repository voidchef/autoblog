import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Headline from '../elements/Home/Headline';
import Categories from '../elements/Home/Categories';
import FeaturedPost from '../elements/Home/FeaturedPost';
import RecentPosts from '../elements/Home/RecentPosts';
import Footer from '../elements/Common/Footer';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { getBlogs } from '../../actions/blog';

export default function Home() {
  const dispatch = useAppDispatch();

  const recentBlogs = useAppSelector((state) => state.blog.allBlogs);
  const featuredBlogs = useAppSelector((state) => state.blog.featuredBlogs.results);

  React.useEffect(() => {
    dispatch(getBlogs({ limit: 6, populate: 'author', isFeatured: true, isPublished: true }));
    dispatch(getBlogs({ limit: 4, populate: 'author', isPublished: true, isFeatured: false, sortBy: 'createdAt' }));
  }, []);

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
        {featuredBlogs.length > 0 && <FeaturedPost featuredBlogs={featuredBlogs} />}
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '7rem' } }}
      >
        {recentBlogs.length > 0 && <RecentPosts recentBlogs={recentBlogs} />}
      </Box>
      <Box sx={{ my: 4 }} />
      <Footer />
    </Box>
  );
}
