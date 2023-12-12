import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Typography } from '@mui/material';
import Title from '../elements/Blog/Title';
import { marked } from 'marked';
import { useAppDispatch, useAppSelector } from '../../utils/reduxHooks';
import { Helmet } from 'react-helmet-async';
import { AWS_BASEURL } from '../../utils/consts';
import { useLocation, useParams } from 'react-router-dom';
import { getBlog } from '../../actions/blog';

export default function Blog() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { preview } = useParams();
  const slug = location.pathname.split('/')[2];

  React.useEffect(() => {
    if (!preview) dispatch(getBlog(slug));
  }, []);

  const blogData = useAppSelector((state) => state.blog.blogData);

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
        <Title title={blogData ? blogData.category : 'Loading'} />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '25rem' } }}
      >
        {blogData && (
          <Box
            textAlign={'center'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            sx={{ gap: { xs: 1, sm: 2 } }}
          >
            <Helmet>
              <title>{blogData.seoTitle}</title>
              <meta name="description" content={blogData.seoDescription} />
            </Helmet>
            <Typography component={'div'} fontSize={{ xs: '2rem', sm: '3rem' }} textAlign={'center'}>
              {blogData.title}
            </Typography>
            <Box>
              <Typography component={'div'} fontSize={'1rem'} textAlign={'left'}>
                <span style={{ color: '#6D6E76' }}>By </span>
                <span style={{ color: '#555FAC', fontWeight: 700 }}>{blogData.author.name}</span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>
                  {new Date(blogData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>{blogData.readingTime} mins</span>
              </Typography>
            </Box>
            <Box height={{ xs: '15rem', sm: '23rem' }} maxWidth={'100%'} display={'flex'} justifyContent={'center'}>
              <img
                src={`${AWS_BASEURL}/blogs/${blogData.id}/1.img`}
                alt={blogData.topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </Box>
            <Typography component={'div'} fontSize={{ sx: '1rem', sm: '1.1rem' }} textAlign={'left'}>
              <div dangerouslySetInnerHTML={{ __html: marked(blogData.content) }} />
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
