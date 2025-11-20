import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  ThumbUp,
  ThumbDown,
  ChatBubbleOutline,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { useGetUserQuery } from '../../services/userApi';
import { useGetBlogsQuery } from '../../services/blogApi';
import { ROUTES } from '../../utils/routing/routes';
import { stringAvatar } from '../../utils/utils';
import FollowButton from '../elements/FollowButton';
import { useAuth } from '../../utils/hooks';

const Author: React.FC = () => {
  const theme = useTheme();
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // Fetch author data
  const { data: authorData, isLoading: authorLoading, error: authorError } = useGetUserQuery(authorId || '', {
    skip: !authorId,
  });

  // Fetch author's published blogs (not drafts)
  const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery(
    {
      author: authorId || '',
      isPublished: true,
      isDraft: false,
      limit: 100,
      page: 1,
    },
    {
      skip: !authorId,
    }
  );

  const handleBlogClick = (slug: string) => {
    navigate(`${ROUTES.BLOG}/${slug}`);
  };

  if (authorLoading) {
    return (
      <Box>
        <NavBar />
        <Container sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} />
        </Container>
        <Footer />
      </Box>
    );
  }

  if (authorError || !authorData) {
    return (
      <Box>
        <NavBar />
        <Container sx={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h5" color="error">
            Author not found
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  const publishedBlogs = blogsData?.results || [];
  const totalLikes = publishedBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
  const totalArticles = blogsData?.totalResults || 0;

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.background.default
            : theme.palette.customColors.pageBackground.light,
        minHeight: '100vh',
      }}
    >
      <NavBar />
      
      {/* Hero Section with Author Info */}
      <Box
        sx={{
          background:
            theme.palette.mode === 'dark'
              ? theme.palette.customColors.author.headerGradientDark
              : theme.palette.customColors.author.headerGradientLight,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.author.radialOverlayDark
                : theme.palette.customColors.author.radialOverlayLight,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Avatar
                src={authorData.profilePicture || undefined}
                {...(!authorData.profilePicture ? stringAvatar(authorData.name) : {})}
                sx={{
                  width: 180,
                  height: 180,
                  fontSize: '3rem',
                  margin: { xs: '0 auto', md: 0 },
                  boxShadow: theme.palette.customColors.author.profileShadow,
                  border: theme.palette.customColors.author.profileBorder,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                  {authorData.name}
                </Typography>
                
                {authorData.role && (
                  <Chip
                    label={authorData.role.toUpperCase()}
                    sx={{
                      mb: 2,
                      bgcolor: theme.palette.customColors.author.statsBgOverlay,
                      color: 'white',
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                      fontSize: '0.875rem',
                      border: theme.palette.customColors.author.profileBorder,
                    }}
                  />
                )}

                {authorData.bio && (
                  <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, fontWeight: 400, lineHeight: 1.6 }}>
                    {authorData.bio}
                  </Typography>
                )}

                {/* Stats */}
                <Stack
                  direction="row"
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ 
                    mb: 3, 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                    rowGap: 2,
                  }}
                >
                  <Box sx={{ textAlign: 'center', minWidth: { xs: '70px', sm: 'auto' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {totalArticles}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Articles
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: '70px', sm: 'auto' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {authorData.followers?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Followers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: '70px', sm: 'auto' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {authorData.following?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Following
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: '70px', sm: 'auto' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {totalLikes}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Likes
                    </Typography>
                  </Box>
                </Stack>

                {/* Social Links and Follow Button */}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  {authorData.socialLinks?.twitter && (
                    <Tooltip title="Twitter">
                      <IconButton
                        href={authorData.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'white',
                          bgcolor: theme.palette.customColors.author.statsItemBg,
                          '&:hover': { bgcolor: theme.palette.customColors.author.statsItemHover },
                        }}
                      >
                        <TwitterIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {authorData.socialLinks?.linkedin && (
                    <Tooltip title="LinkedIn">
                      <IconButton
                        href={authorData.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'white',
                          bgcolor: theme.palette.customColors.author.statsItemBg,
                          '&:hover': { bgcolor: theme.palette.customColors.author.statsItemHover },
                        }}
                      >
                        <LinkedInIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {authorData.socialLinks?.github && (
                    <Tooltip title="GitHub">
                      <IconButton
                        href={authorData.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'white',
                          bgcolor: theme.palette.customColors.author.statsItemBg,
                          '&:hover': { bgcolor: theme.palette.customColors.author.statsItemHover },
                        }}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {authorData.socialLinks?.website && (
                    <Tooltip title="Website">
                      <IconButton
                        href={authorData.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'white',
                          bgcolor: theme.palette.customColors.author.statsItemBg,
                          '&:hover': { bgcolor: theme.palette.customColors.author.statsItemHover },
                        }}
                      >
                        <LanguageIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {userId !== authorId && (
                    <Box 
                      sx={{ 
                        ml: 2,
                        '& button': {
                          bgcolor: 'white',
                          color: 'primary.main',
                          fontWeight: 700,
                          px: 3,
                          py: 1.2,
                          fontSize: '1rem',
                          boxShadow: theme.palette.customColors.author.contactButtonShadow,
                          '&:hover': {
                            bgcolor: theme.palette.customColors.author.contactButtonHover,
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.customColors.author.contactButtonHoverShadow,
                          },
                        },
                      }}
                    >
                      <FollowButton
                        authorId={authorId || ''}
                        authorName={authorData.name}
                        size="large"
                        variant="contained"
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
            textAlign: 'center',
          }}
        >
          Articles ({totalArticles})
        </Typography>

        {blogsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : publishedBlogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No published articles yet
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {publishedBlogs.map((blog) => (
              <Grid size={{ xs: 12, sm: 4 }} key={blog.id}>
                <Box
                  sx={{ py: 1, cursor: 'pointer' }}
                  height={{ xs: '15rem', sm: '18rem' }}
                  maxWidth={'100%'}
                  onClick={() => handleBlogClick(blog.slug)}
                >
                  <img
                    src={blog.selectedImage}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                  />
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={authorData.profilePicture || undefined}
                      {...(!authorData.profilePicture ? stringAvatar(authorData.name) : {})}
                      sx={{
                        width: 36,
                        height: 36,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize="0.875rem"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {authorData.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    fontSize={{ sm: 22 }}
                    fontWeight={500}
                    component="div"
                    sx={{
                      flexGrow: 1,
                      marginBottom: 1,
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    {blog.title}
                  </Typography>
                  <Typography
                    fontSize={{ sm: 18 }}
                    component="div"
                    sx={{
                      flexGrow: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    {blog.seoDescription ? `${blog.seoDescription.slice(0, 255)}...` : `${blog.content.slice(0, 255)}...`}
                  </Typography>

                  {/* Engagement Stats */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 2,
                      alignItems: 'center',
                      color: (theme) => theme.palette.customColors.textMuted,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUp fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">{blog.likes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbDown fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">{blog.dislikes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatBubbleOutline fontSize="small" sx={{ fontSize: '1rem' }} />
                      <Typography variant="body2">Comments</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default Author;
