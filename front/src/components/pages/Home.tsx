import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Headline from '../elements/Home/Headline';
import Categories from '../elements/Home/Categories';
import FeaturedPost from '../elements/Home/FeaturedPost';
import RecentPosts from '../elements/Home/RecentPosts';
import Footer from '../elements/Common/Footer';
import { useGetBlogsQuery } from '../../services/blogApi';
import { Helmet } from 'react-helmet-async';

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
      <Helmet>
        <title>AutoBlog - AI-Powered Blog Generation Platform</title>
        <meta name="description" content="Create high-quality, SEO-optimized blog posts with our AI-powered platform. Generate engaging content in multiple languages with advanced SEO features." />
        <meta name="keywords" content="AI blog generation, SEO content, automated blogging, content creation, blog writing" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AutoBlog - AI-Powered Blog Generation Platform" />
        <meta property="og:description" content="Create high-quality, SEO-optimized blog posts with our AI-powered platform." />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="AutoBlog" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AutoBlog - AI-Powered Blog Generation Platform" />
        <meta name="twitter:description" content="Create high-quality, SEO-optimized blog posts with our AI-powered platform." />
      </Helmet>
      
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
