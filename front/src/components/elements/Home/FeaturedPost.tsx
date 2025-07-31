import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, useTheme } from '@mui/material';
import { AWS_BASEURL } from '../../../utils/consts';
import { IBlog } from '../../../reducers/blog';
import { ROUTES } from '../../../utils/routing/routes';
import { useNavigate } from 'react-router-dom';

interface FeaturedPostProps {
  featuredBlogs: IBlog[];
}

const FeaturedPost = ({ featuredBlogs }: FeaturedPostProps) => {
  const navigate = useNavigate();

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <Grid container sx={{ justifyContent: featuredBlogs.length > 1? 'space-between' : 'center' }}>
      <Grid size={{ xs: 12, sm: 6 }} container sx={{ p: { xs: 0, sm: 1 }, border: '2px solid #E0E0E0' }}>
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
            <Box
              sx={{ p: 1 }}
              height={{ xs: '15rem', sm: '20rem' }}
              maxWidth={'100%'}
              display={'flex'}
              justifyContent={'center'}
            >
              <img
                src={`${AWS_BASEURL}/blogs/${featuredBlogs[0].id}/1.img`}
                alt={featuredBlogs[0].topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </Box>
            <Box sx={{ my: 4 }} />
            <Typography component="div" sx={{ flexGrow: 1, marginBottom: '1rem' }}>
              By <span style={{ color: '#555FAC' }}>{featuredBlogs[0].author.name}</span> |{' '}
              <span style={{ color: '#6D6E76' }}>
                {new Date(featuredBlogs[0].createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </Typography>
            <Typography fontSize={{ xs: '1.2rem', sm: '1.5rem' }} component="div" sx={{ flexGrow: 1, marginBottom: '1rem' }}>
              {featuredBlogs[0].title}
            </Typography>
            <Typography
              fontSize={{ xs: '1rem', sm: '1.2rem' }}
              color={'#6D6E76'}
              component="div"
              sx={{ flexGrow: 1, marginBottom: '1rem' }}
            >
              {`${featuredBlogs[0].content.slice(0, 255)}...`}
            </Typography>
            <Button variant="contained" onClick={() => handleClick(featuredBlogs[0].slug)}>
              Read More {'>'}
            </Button>
          </Box>
        </Box>
      </Grid>
      {featuredBlogs.length > 1 && (
        <Grid size={{ xs: 12, sm: 6 }} container sx={{ p: { xs: 0, sm: 1 } }}>
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
              <Button variant="text" sx={{ whiteSpace: 'nowrap' }}>
                View All
              </Button>
            </Box>
            <Box display={'flex'} flexDirection={'column'} sx={{ gap: 2, flexGrow: 1 }}>
              {featuredBlogs.map(
                (post: IBlog, index: number) =>
                  //start from 1 because 0 is already displayed
                  index !== 0 && (
                    <Box key={index} display={'flex'} flexDirection={'column'} sx={{ gap: 1 }}>
                      <Typography fontSize={{ xs: 15 }} component="div" sx={{ flexGrow: 1 }}>
                        By <span style={{ color: '#555FAC' }}>{post.author.name}</span> |{' '}
                        <span style={{ color: '#6D6E76' }}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </Typography>
                      <Typography fontSize={{ xs: 18, sm: 20 }} component="div" sx={{ flexGrow: 1 }}>
                        {post.topic}
                      </Typography>
                    </Box>
                  ),
              )}
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default FeaturedPost;
