import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Button,
  useTheme,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`author-tabpanel-${index}`}
      aria-labelledby={`author-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Author: React.FC = () => {
  const theme = useTheme();
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        <Paper
          elevation={0}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.customColors.author.bioCardBgDark : theme.palette.customColors.author.bioCardBgLight,
            borderRadius: 3,
            overflow: 'hidden',
            border: theme.palette.mode === 'dark' ? theme.palette.customColors.author.bioCardBorder : 'none',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              borderBottom: 1,
              borderColor: theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.light : 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 120,
                color: theme.palette.mode === 'dark' ? theme.palette.customColors.overlay.white.almostOpaque : 'inherit',
                '&.Mui-selected': {
                  color: theme.palette.mode === 'dark' ? theme.palette.customColors.author.accentBlue : 'primary.main',
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.customColors.author.accentBlue : 'primary.main',
              },
            }}
          >
            <Tab icon={<ArticleIcon />} iconPosition="start" label={`Articles (${totalArticles})`} />
          </Tabs>

          {/* Articles Tab */}
          <TabPanel value={tabValue} index={0}>
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
              <Grid container spacing={3} sx={{ p: 3 }}>
                {publishedBlogs.map((blog) => (
                  <Grid size={{ xs: 12 }} key={blog.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? theme.palette.customColors.author.articleCardShadowDark
                              : theme.palette.customColors.author.articleCardShadowLight,
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.customColors.author.articleCardBgDark : theme.palette.customColors.author.articleCardBgLight,
                        border: theme.palette.mode === 'dark' ? theme.palette.customColors.author.bioCardBorder : 'none',
                        backgroundImage:
                          theme.palette.mode === 'dark'
                            ? theme.palette.customColors.author.articleCardGradientDark
                            : 'none',
                      }}
                      onClick={() => handleBlogClick(blog.slug)}
                    >
                      {blog.selectedImage && (
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 240 },
                            height: { xs: 200, sm: 'auto' },
                            minHeight: { sm: 180 },
                            backgroundImage: `url(${blog.selectedImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <CardContent sx={{ flex: 1, p: 3 }}>
                        <Stack spacing={2}>
                          {/* Category and Reading Time */}
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={blog.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                borderColor:
                                  theme.palette.mode === 'dark' ? theme.palette.customColors.author.accentPurple : undefined,
                                color:
                                  theme.palette.mode === 'dark' ? theme.palette.customColors.author.accentPurpleHover : undefined,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {blog.readingTime} min read
                            </Typography>
                          </Stack>

                          {/* Title */}
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {blog.title}
                          </Typography>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {blog.seoDescription}
                          </Typography>

                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {blog.tags.slice(0, 3).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    bgcolor:
                                      theme.palette.mode === 'dark' ? theme.palette.customColors.author.categoryChipBgDark : theme.palette.customColors.author.categoryChipBgLight,
                                    color:
                                      theme.palette.mode === 'dark' ? theme.palette.customColors.author.categoryChipText : 'inherit',
                                    fontSize: '0.75rem',
                                    border:
                                      theme.palette.mode === 'dark' ? theme.palette.customColors.author.categoryChipBorder : 'none',
                                  }}
                                />
                              ))}
                            </Stack>
                          )}

                          {/* Stats */}
                          <Stack direction="row" spacing={3} alignItems="center">
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <ThumbUp sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {blog.likes?.length || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <ThumbDown sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {blog.dislikes?.length || 0}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default Author;
