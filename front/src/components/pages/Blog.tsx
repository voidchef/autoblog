import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Typography } from '@mui/material';
import Title from '../elements/Blog/Title';
import { marked } from 'marked';
import { useGetBlogQuery } from '../../services/blogApi';
import { useAppSelector } from '../../utils/reduxHooks';
import { Helmet } from 'react-helmet-async';
import { AWS_BASEURL } from '../../utils/consts';
import { useLocation, useParams } from 'react-router-dom';

export default function Blog() {
  const location = useLocation();
  const { preview } = useParams();
  const slug = location.pathname.split('/')[2];

  const { data: blogData, isLoading } = useGetBlogQuery(slug, {
    skip: !!preview // Skip query if in preview mode
  });

  // For preview mode, get data from Redux state
  const previewBlogData = useAppSelector((state) => state.blog.blogData);
  const currentBlogData = preview ? previewBlogData : blogData;

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
        <Title title={currentBlogData ? currentBlogData.category : 'Loading'} />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '25rem' } }}
      >
        {isLoading && !preview ? (
          <Box textAlign={'center'}>
            <Typography component={'div'} fontSize={'1.5rem'}>
              Loading blog...
            </Typography>
          </Box>
        ) : currentBlogData ? (
          <Box
            textAlign={'center'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            sx={{ gap: { xs: 1, sm: 2 } }}
          >
            <Helmet>
              <title>{currentBlogData.seoTitle}</title>
              <meta name="description" content={currentBlogData.seoDescription} />
            </Helmet>
            <Typography component={'div'} fontSize={{ xs: '2rem', sm: '3rem' }} textAlign={'center'}>
              {currentBlogData.title}
            </Typography>
            <Box>
              <Typography component={'div'} fontSize={'1rem'} textAlign={'left'}>
                <span style={{ color: '#6D6E76' }}>By </span>
                <span style={{ color: '#555FAC', fontWeight: 700 }}>{currentBlogData.author?.name || 'Unknown'}</span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>
                  {new Date(currentBlogData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>{currentBlogData.readingTime} mins</span>
              </Typography>
            </Box>
            <Box height={{ xs: '15rem', sm: '23rem' }} maxWidth={'100%'} display={'flex'} justifyContent={'center'}>
              <img
                src={`${AWS_BASEURL}/blogs/${currentBlogData.id}/1.img`}
                alt={currentBlogData.topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </Box>
            <Typography component={'div'} fontSize={{ sx: '1rem', sm: '1.1rem' }} textAlign={'left'}>
              <div dangerouslySetInnerHTML={{ __html: marked(currentBlogData.content) }} />
            </Typography>
          </Box>
        ) : (
          <Box textAlign={'center'}>
            <Typography component={'div'} fontSize={'1.5rem'}>
              Blog not found
            </Typography>
          </Box>
        )}
        <Box sx={{ my: 2 }} />
      </Box>
      <Box sx={{ my: 6 }} />
      <Footer />
    </Box>
  );
}
