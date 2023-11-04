import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';

const posts = [
  {
    author: 'James West',
    title: 'Figma design systems that you can download for free today.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc porta, nisi vel pulvinar tincidunt, arcu diam molestie metus, id viverra ante dolor ultrices nisl. Sed ut elit fringilla',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: '8 Figma design systems that you can download for free today.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc porta, nisi vel pulvinar tincidunt, arcu diam molestie metus, id viverra ante dolor ultrices nisl. Sed ut elit fringilla',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: 'Figma design systems that you can download for free today.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc porta, nisi vel pulvinar tincidunt, arcu diam molestie metus, id viverra ante dolor ultrices nisl. Sed ut elit fringilla',
    date: 'May 23, 2022',
  },
  {
    author: 'James West',
    title: 'Figma design systems that you can download for free today.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc porta, nisi vel pulvinar tincidunt, arcu diam molestie metus, id viverra ante dolor ultrices nisl. Sed ut elit fringilla',
    date: 'May 23, 2022',
  },
];

const RecentPosts = () => {
  const navigate = useNavigate()
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography
          variant="h2"
          component="div"
          fontSize={{ xs: '1.5rem', sm: '2rem' }}
          fontWeight={500}
          color="black"
          marginBottom={2}
        >
          Recent Posts
        </Typography>
        <Button variant="text" onClick={() => navigate(ROUTES.ALLPOSTS) }>View All</Button>
      </Box>
      <Grid
        container
        sx={{
          justifyContent: 'space-between',
          alignContent: 'space-between',
          gap: { xs: 3, sm: 5 },
          padding: { xs: 2, sm: 5 },
        }}
      >
        {posts.map((post, index) => (
          <Grid item xs={12} sm={5.75} key={index}>
            <Box sx={{ p: 1, background: '#E9EAF4' }} height={{ xs: '15rem', sm: '18rem' }} marginBottom={4} />
            <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
              <Typography fontSize={{ sm: 15 }} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                By <span style={{ color: '#555FAC' }}>{post.author}</span> | {post.date}
              </Typography>
              <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                {post.title}
              </Typography>
              <Typography fontSize={{ sm: 18 }} component="div" sx={{ flexGrow: 1 }}>
                {post.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default RecentPosts;
