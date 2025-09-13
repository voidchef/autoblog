import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { IBlog } from '../../../reducers/blog';

interface RecentPostProps {
  recentBlogs: IBlog[];
}

const RecentPosts = ({ recentBlogs }: RecentPostProps) => {
  const navigate = useNavigate();

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <React.Fragment>
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
        <Button variant="text" onClick={() => navigate(ROUTES.ALLPOSTS)}>
          View All
        </Button>
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
        {recentBlogs.map((post, index) => (
          <Grid size={{ xs: 12, sm: 5.55 }} key={index} onClick={() => handleClick(post.slug)}>
            <Box
              sx={{ p: 1 }}
              height={{ xs: '15rem', sm: '18rem' }}
              maxWidth={'100%'}
              display={'flex'}
              justifyContent={'center'}
              marginBottom={4}
            >
              <img
                src={post.selectedImage}
                alt={post.topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </Box>
            <Box sx={{ my: 4 }} />
            <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
              <Typography fontSize={{ sm: 15 }} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                By <span style={{ color: '#555FAC' }}>{post.author.name}</span> |{' '}
                <span style={{ color: '#6D6E76' }}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </Typography>
              <Typography fontSize={{ sm: 22 }} fontWeight={500} component="div" sx={{ flexGrow: 1, marginBottom: 1 }}>
                {post.topic}
              </Typography>
              <Typography fontSize={{ sm: 18 }} component="div" sx={{ flexGrow: 1 }}>
                {`${post.content.slice(0, 255)}...`}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export default RecentPosts;
