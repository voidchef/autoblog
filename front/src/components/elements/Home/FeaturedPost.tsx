import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, useTheme } from '@mui/material';

const posts = [
  {
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget tristique velit.',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget tristique velit.',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget tristique velit.',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget tristique velit.',
    date: 'May 23, 2022',
  },
];

const FeaturedPost = () => {
  return (
    <Grid container sx={{ justifyContent: 'space-between' }}>
      <Grid item xs={12} sm={6} container sx={{ p: { xs: 0, sm: 1 }, border: '2px solid #E0E0E0' }}>
        <Box sx={{ m: 2 }}>
          <Typography
            variant="h2"
            component="div"
            fontSize={{ xs: '1.5rem', sm: '2rem' }}
            fontWeight={500}
            color={'black'}
            marginBottom={2}
          >
            Featured Post
          </Typography>
          <Box>
            <Box sx={{ p: 1, background: '#E9EAF4' }} height={{ xs: '15rem', sm: '20rem' }} />
            <Box sx={{ my: 4 }} />
            <Typography component="div" sx={{ flexGrow: 1, marginBottom: '1rem' }}>
              By <span style={{ color: '#555FAC' }}>James West</span> | May 23, 2022
            </Typography>
            <Typography fontSize={{ xs: '1.2rem', sm: '1.5rem' }} component="div" sx={{ flexGrow: 1, marginBottom: '1rem' }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident.
            </Typography>
            <Typography
              fontSize={{ xs: '1rem', sm: '1.2rem' }}
              color={'#6D6E76'}
              component="div"
              sx={{ flexGrow: 1, marginBottom: '1rem' }}
            >
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident.
            </Typography>
            <Button variant="contained">Read More {'>'}</Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} container sx={{ p: { xs: 0, sm: 1 } }}>
        <Box sx={{ m: 2 }}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" marginBottom={{ xs: '1rem', sm: '2rem' }}>
            <Typography
              variant="h2"
              component="div"
              fontSize={{ xs: '1.5rem', sm: '2rem' }}
              fontWeight={500}
              color="primary"
            >
              All Featured Posts
            </Typography>
            <Button variant="text">View All</Button>
          </Box>
          <Box display={'flex'} flexDirection={'column'} sx={{ gap: 2 }}>
            {posts.map((post) => (
              <Box display={'flex'} flexDirection={'column'} sx={{ gap: 1 }}>
                <Typography fontSize={{ xs: 15 }} component="div" sx={{ flexGrow: 1 }}>
                  By <span style={{ color: '#555FAC' }}>{post.author}</span> | {post.date}
                </Typography>
                <Typography fontSize={{ xs: 18, sm: 20 }} component="div" sx={{ flexGrow: 1 }}>
                  {post.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FeaturedPost;
