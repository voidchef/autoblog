import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Card, CardMedia, CardContent, Chip, Stack, Avatar, IconButton } from '@mui/material';
import { ThumbUp, ThumbDown, AccessTime, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import { IBlog } from '../../../reducers/blog';
import { stringAvatar } from '../../../utils/utils';

interface RecentPostProps {
  recentBlogs: IBlog[];
}

const RecentPosts = ({ recentBlogs }: RecentPostProps) => {
  const navigate = useNavigate();

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <Box sx={{ mb: { xs: 6, md: 8 } }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2, px: { xs: 1, md: 0 } }}
        className="animate-fade-in-up"
      >
        <Box>
          <Chip
            icon={<AccessTime sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: '#fff !important' }} />}
            label="Latest Articles"
            sx={{
              mb: 3,
              fontWeight: 700,
              px: { xs: 2, md: 2.5 },
              py: { xs: 2, md: 2.5 },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              background: (theme) => theme.palette.customColors.gradients.primaryReverse,
              color: 'white',
              border: 'none',
              boxShadow: (theme) => `0 4px 16px ${theme.palette.customColors.shadows.secondary}`,
              '&:hover': {
                boxShadow: (theme) => `0 6px 24px ${theme.palette.customColors.shadows.secondaryHeavy}`,
              },
              '& .MuiChip-icon': {
                color: '#fff !important',
              },
            }}
          />
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
              fontWeight: 900,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.customColors.gradients.textDarkSecondary
                  : theme.palette.customColors.gradients.textLightSecondary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Recent Posts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={() => navigate(ROUTES.ALLPOSTS)}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            borderWidth: 2,
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'primary.main' : 'secondary.main'),
            color: (theme) => (theme.palette.mode === 'dark' ? 'primary.main' : 'secondary.main'),
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 3,
            '&:hover': {
              borderWidth: 2,
              background: (theme) => (theme.palette.mode === 'dark' ? 'primary.main' : 'secondary.main'),
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' ? `0 8px 24px ${theme.palette.customColors.shadows.primary}` : `0 8px 24px ${theme.palette.customColors.shadows.secondary}`,
            },
          }}
        >
          View All
        </Button>
      </Box>

      <Grid container spacing={3}>
        {recentBlogs.map((post, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 6 }} key={index}>
            <Card
              className="animate-fade-in-up"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.customColors.gradients.cardDark
                    : theme.palette.customColors.gradients.cardLight,
                border: '2px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.customColors.borders.secondaryDark : theme.palette.customColors.borders.secondaryLight,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'secondary.main',
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 20px 60px ${theme.palette.customColors.shadows.secondary}`,
                  '& .recent-post-image': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
              onClick={() => handleClick(post.slug)}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  className="recent-post-image"
                  image={post.selectedImage}
                  alt={post.topic}
                  sx={{
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: 350,
                  }}
                />
                {post.category && (
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: (theme) => theme.palette.customColors.gradients.primaryReverse,
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: '20px',
                      boxShadow: (theme) => `0 2px 8px ${theme.palette.customColors.shadows.secondary}`,
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 1.25, px: 1.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <Avatar
                    src={post.author.profilePicture || undefined}
                    {...(!post.author.profilePicture ? stringAvatar(post.author.name) : {})}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.author?.id) navigate(`${ROUTES.AUTHOR}/${post.author.id}`);
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      fontSize="0.875rem"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.author?.id) navigate(`${ROUTES.AUTHOR}/${post.author.id}`);
                      }}
                    >
                      {post.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.3,
                    mb: 0.75,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.title || post.topic}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    fontSize: '0.8rem',
                  }}
                >
                  {post.excerpt}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 0.75,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.3,
                          color: 'text.secondary',
                        }}
                      >
                        <ThumbUp sx={{ fontSize: '0.8rem' }} />
                        <Typography variant="caption" fontWeight={500} fontSize="0.65rem">
                          {post.likes?.length || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.3,
                          color: 'text.secondary',
                        }}
                      >
                        <ThumbDown sx={{ fontSize: '0.8rem' }} />
                        <Typography variant="caption" fontWeight={500} fontSize="0.65rem">
                          {post.dislikes?.length || 0}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primary.main' : 'secondary.main'),
                        color: 'white',
                        width: 26,
                        height: 26,
                        '&:hover': {
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'primary.dark' : 'secondary.dark'),
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(post.slug);
                      }}
                    >
                      <ArrowForward sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mobile View All Button */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={() => navigate(ROUTES.ALLPOSTS)}
          fullWidth
          sx={{
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          View All Posts
        </Button>
      </Box>
    </Box>
  );
};

export default RecentPosts;
