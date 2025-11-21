import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, Card, CardMedia, CardContent, Chip, Stack, Avatar } from '@mui/material';
import { ThumbUp, ThumbDown, Visibility, TrendingUp } from '@mui/icons-material';
import { AWS_BASEURL } from '../../../utils/consts';
import { IBlog } from '../../../reducers/blog';
import { ROUTES } from '../../../utils/routing/routes';
import { useNavigate } from 'react-router-dom';
import { stringAvatar } from '../../../utils/utils';

interface FeaturedPostProps {
  featuredBlogs: IBlog[];
}

const FeaturedPost = ({ featuredBlogs }: FeaturedPostProps) => {
  const navigate = useNavigate();

  const handleClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }} className="animate-fade-in-up">
        <Chip
          icon={<TrendingUp sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: (theme) => theme.palette.customColors.icon.onBrand }} />}
          label="Featured Content"
          sx={{
            mb: 3,
            fontWeight: 700,
            px: { xs: 2, md: 2.5 },
            py: { xs: 2, md: 2.5 },
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            background: (theme) => theme.palette.customColors.gradients.primary,
            color: 'white',
            border: 'none',
            boxShadow: (theme) => `0 4px 16px ${theme.palette.customColors.shadows.primary}`,
            '&:hover': {
              boxShadow: (theme) => `0 6px 24px ${theme.palette.customColors.shadows.primaryHeavy}`,
            },
            '& .MuiChip-icon': {
              color: (theme) => theme.palette.customColors.icon.onBrand,
            },
          }}
        />
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            fontWeight: 900,
            mb: 2,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.gradients.textDarkAlt
                : theme.palette.customColors.gradients.textLightAlt,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Featured Posts
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: '650px', mx: 'auto', fontSize: { xs: '0.95rem', md: '1.1rem' }, lineHeight: 1.7, px: { xs: 2, md: 0 } }}
        >
          Discover our handpicked selection of outstanding blog posts
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Featured Post */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            className="animate-scale-in"
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
              borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.customColors.borders.primaryDark : theme.palette.customColors.borders.primaryDark),
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: (theme) => theme.palette.customColors.gradients.overlayLight,
                opacity: 0,
                transition: 'opacity 0.4s ease',
                zIndex: 1,
              },
              '&:hover::before': {
                opacity: 1,
              },
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: (theme) => `0 24px 64px ${theme.palette.customColors.shadows.primary}`,
                transform: 'translateY(-8px)',
                '& .featured-image': {
                  transform: 'scale(1.08)',
                },
              },
            }}
            onClick={() => handleClick(featuredBlogs[0].slug)}
          >
            <CardMedia
              component="img"
              className="featured-image"
              image={featuredBlogs[0].selectedImage}
              alt={featuredBlogs[0].topic}
              sx={{
                height: { xs: 250, sm: 300, md: 350 },
                objectFit: 'cover',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 2, py: { xs: 2, md: 2.5 }, px: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  label="Featured"
                  size="small"
                  sx={{
                    background: (theme) => theme.palette.customColors.gradients.primary,
                    color: 'white',
                    fontWeight: 700,
                    px: 1,
                    height: '20px',
                    fontSize: '0.7rem',
                    boxShadow: (theme) => `0 2px 8px ${theme.palette.customColors.shadows.primary}`,
                    '&:hover': {
                      boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.shadows.primaryHeavy}`,
                    },
                  }}
                />
                {featuredBlogs[0].category && (
                  <Chip
                    label={featuredBlogs[0].category}
                    size="small"
                    sx={{
                      background: (theme) => theme.palette.customColors.gradients.primaryReverse,
                      color: 'white',
                      fontWeight: 700,
                      px: 1,
                      height: '20px',
                      fontSize: '0.7rem',
                      boxShadow: (theme) => `0 2px 8px ${theme.palette.customColors.shadows.secondary}`,
                      '&:hover': {
                        boxShadow: (theme) => `0 4px 12px ${theme.palette.customColors.shadows.secondaryHeavy}`,
                      },
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.3,
                  mb: 0.75,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {featuredBlogs[0].title}
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
                  fontSize: '0.875rem',
                }}
              >
                {featuredBlogs[0].excerpt}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={featuredBlogs[0].author.profilePicture || undefined}
                    {...(!featuredBlogs[0].author.profilePicture ? stringAvatar(featuredBlogs[0].author.name) : {})}
                    sx={{
                      width: 36,
                      height: 36,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (featuredBlogs[0].author?.id) navigate(`${ROUTES.AUTHOR}/${featuredBlogs[0].author.id}`);
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
                        if (featuredBlogs[0].author?.id) navigate(`${ROUTES.AUTHOR}/${featuredBlogs[0].author.id}`);
                      }}
                    >
                      {featuredBlogs[0].author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      {new Date(featuredBlogs[0].createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={0.75} sx={{ color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <ThumbUp sx={{ fontSize: '0.8rem' }} />
                    <Typography variant="caption" fontSize="0.65rem">{featuredBlogs[0].likes?.length || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <ThumbDown sx={{ fontSize: '0.8rem' }} />
                    <Typography variant="caption" fontSize="0.65rem">{featuredBlogs[0].dislikes?.length || 0}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(featuredBlogs[0].slug);
                }}
                sx={{
                  mt: 2,
                  py: 0.6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)'
                    : 'linear-gradient(135deg, #1d4ed8 0%, #0d9488 100%)',
                  boxShadow: '0 4px 16px rgba(29, 78, 216, 0.3)',
                  '&:hover': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)'
                      : 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
                    boxShadow: '0 8px 24px rgba(29, 78, 216, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Read Article
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Secondary Featured Posts */}
        {featuredBlogs.length > 1 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {featuredBlogs.slice(1, 4).map((post: IBlog, index: number) => (
                <Card
                  key={index}
                  className="animate-slide-in-right"
                  sx={{
                    display: 'flex',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1a1f35 0%, #252d48 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                    border: '2px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(29, 78, 216, 0.15)' : 'rgba(29, 78, 216, 0.1)',
                    minHeight: { xs: 140, sm: 160 },
                    '&:hover': {
                      transform: 'translateX(12px) translateY(-4px)',
                      borderColor: 'primary.main',
                      boxShadow: '0 12px 40px rgba(29, 78, 216, 0.25)',
                      '& .secondary-featured-image': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                  onClick={() => handleClick(post.slug)}
                >
                  <CardMedia
                    component="img"
                    className="secondary-featured-image"
                    sx={{
                      width: { xs: 120, sm: 140 },
                      minWidth: { xs: 120, sm: 140 },
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    image={post.selectedImage}
                    alt={post.topic}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ mb: 0.5 }}>
                      {post.category && (
                        <Chip 
                          label={post.category} 
                          size="small" 
                          sx={{ 
                            mb: 0.5,
                            height: '18px',
                            fontSize: '0.65rem',
                            background: (theme) => theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, #0d9488 0%, #1d4ed8 100%)'
                              : 'linear-gradient(135deg, #0d9488 0%, #1d4ed8 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }} 
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h6"
                      component="h4"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {post.title || post.topic}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 'auto' }}>
                      <Avatar
                        src={post.author.profilePicture || undefined}
                        {...(!post.author.profilePicture ? stringAvatar(post.author.name) : {})}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.8rem',
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
                          variant="caption" 
                          color="text.primary" 
                          fontSize="0.8rem" 
                          fontWeight={600}
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FeaturedPost;
