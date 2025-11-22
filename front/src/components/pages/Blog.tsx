import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import {
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
} from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import Title from '../elements/Blog/Title';
import { marked } from 'marked';
import {
  useGetBlogQuery,
  useToggleFeaturedMutation,
  IBlog as IBlogAPI,
} from '../../services/blogApi';
import { useAppSelector, useAppDispatch } from '../../utils/reduxHooks';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BlogLikeDislike from '../elements/BlogLikeDislike';
import CommentSection from '../elements/CommentSection';
import ShareButton from '../elements/ShareButton';
import FollowButton from '../elements/FollowButton';
import AudioPlayer from '../elements/AudioPlayer';
import { ROUTES } from '../../utils/routing/routes';
import * as analytics from '../../utils/analytics';
import { useAuth } from '../../utils/hooks';
import { showSuccess, showError, showInfo } from '../../reducers/alert';
import { stringAvatar } from '../../utils/utils';

export default function Blog() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { preview } = useParams();
  const slug = location.pathname.split('/')[2];
  const { user } = useAuth();

  // Check if in preview mode from query params or route params
  const searchParams = new URLSearchParams(location.search);
  const isPreviewMode = preview === 'true' || searchParams.get('preview') === 'true';

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // For preview mode, get data from Redux state
  const previewBlogData = useAppSelector((state) => state.blog.blogData);

  // State to control polling based on audio generation status
  const [shouldPoll, setShouldPoll] = React.useState(false);

  const {
    data: blogData,
    isLoading,
    refetch,
  } = useGetBlogQuery(slug, {
    skip: !!isPreviewMode, // Skip query if in preview mode
    pollingInterval: shouldPoll ? 3000 : 0, // Poll every 3s when processing
  });

  const currentBlogData = (isPreviewMode ? previewBlogData : blogData) as IBlogAPI | null;

  // Toggle featured mutation
  const [toggleFeatured] = useToggleFeaturedMutation();

  // Update polling state based on audio generation status
  React.useEffect(() => {
    setShouldPoll(currentBlogData?.audioGenerationStatus === 'processing');
  }, [currentBlogData?.audioGenerationStatus]);

  // Track blog view when blog loads (only for non-preview mode)
  React.useEffect(() => {
    if (!isPreviewMode && currentBlogData && analytics.isGAInitialized()) {
      analytics.trackBlogView(currentBlogData.id, currentBlogData.title, currentBlogData.category);
    }
  }, [isPreviewMode, currentBlogData?.id]);

  // Track audio generation completion
  const prevAudioStatusRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    const prevStatus = prevAudioStatusRef.current;
    const currentStatus = currentBlogData?.audioGenerationStatus;

    if (prevStatus === 'processing' && currentStatus === 'completed') {
      dispatch(showSuccess('Audio narration is ready! You can now listen to the article.'));
    } else if (prevStatus === 'processing' && currentStatus === 'failed') {
      dispatch(showError('Audio generation failed.'));
    }

    prevAudioStatusRef.current = currentStatus;
  }, [currentBlogData?.audioGenerationStatus, dispatch]);

  const handleToggleFeatured = async () => {
    if (currentBlogData?.id) {
      try {
        const result = await toggleFeatured(currentBlogData.id).unwrap();
        dispatch(showSuccess(`Blog ${result.isFeatured ? 'marked as featured' : 'unmarked as featured'}!`));
        // Trigger a refetch to update the UI
        refetch();
      } catch (error: any) {
        dispatch(showError(error?.data?.message || 'Failed to toggle featured status'));
      }
    }
  };

  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{
          gap: { xs: 2, sm: 5 },
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.background.default
              : theme.palette.customColors.pageBackground.light,
        }}
      >
        <NavBar />
        <Title title={currentBlogData ? currentBlogData.category : 'Loading'} />
      </Box>
      <Box sx={{ my: { xs: 2, md: 4 } }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '3rem', md: '10rem', lg: '22rem' }, px: { xs: 1, sm: 0 } }}
      >
        {isLoading && !isPreviewMode ? (
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

              {/* Open Graph / Facebook */}
              <meta property="og:type" content="article" />
              <meta property="og:title" content={currentBlogData.seoTitle} />
              <meta property="og:description" content={currentBlogData.seoDescription} />
              <meta property="og:image" content={currentBlogData.selectedImage} />
              <meta property="og:url" content={window.location.href} />
              <meta property="og:site_name" content="AutoBlog" />
              <meta property="article:author" content={currentBlogData.author?.name} />
              <meta property="article:published_time" content={new Date(currentBlogData.createdAt).toISOString()} />
              <meta property="article:modified_time" content={new Date(currentBlogData.updatedAt).toISOString()} />
              <meta property="article:section" content={currentBlogData.category} />
              {currentBlogData.tags &&
                currentBlogData.tags.map((tag: string, index: number) => (
                  <meta key={index} property="article:tag" content={tag} />
                ))}

              {/* Twitter */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={currentBlogData.seoTitle} />
              <meta name="twitter:description" content={currentBlogData.seoDescription} />
              <meta name="twitter:image" content={currentBlogData.selectedImage} />

              {/* Additional SEO */}
              <meta name="keywords" content={currentBlogData.tags?.join(', ')} />
              <meta name="author" content={currentBlogData.author?.name} />
              <meta name="robots" content="index, follow" />
              <link rel="canonical" href={window.location.href} />

              {/* JSON-LD Structured Data */}
              <script type="application/ld+json">
                {JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BlogPosting',
                  headline: currentBlogData.title,
                  description: currentBlogData.seoDescription,
                  image: currentBlogData.selectedImage,
                  author: {
                    '@type': 'Person',
                    name: currentBlogData.author?.name,
                  },
                  publisher: {
                    '@type': 'Organization',
                    name: 'AutoBlog',
                    logo: {
                      '@type': 'ImageObject',
                      url: `${window.location.origin}/vite.svg`,
                    },
                  },
                  datePublished: new Date(currentBlogData.createdAt).toISOString(),
                  dateModified: new Date(currentBlogData.updatedAt).toISOString(),
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': window.location.href,
                  },
                  keywords: currentBlogData.tags?.join(', '),
                  wordCount: currentBlogData.content?.split(/\s+/).length,
                  timeRequired: `PT${currentBlogData.readingTime}M`,
                })}
              </script>
            </Helmet>
            <Typography
              component={'div'}
              fontSize={{ xs: '1.75rem', sm: '2.5rem', md: '3rem' }}
              textAlign={'center'}
              fontWeight={700}
            >
              {currentBlogData.title}
            </Typography>

            {/* Author Row */}
            <Box
              display={'flex'}
              justifyContent={'flex-start'}
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={{ xs: 1, sm: 2 }}
              sx={{ width: '100%' }}
            >
              {/* Author Avatar and Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Avatar
                  src={currentBlogData.author.profilePicture || undefined}
                  {...(!currentBlogData.author.profilePicture ? stringAvatar(currentBlogData.author.name) : {})}
                  sx={{
                    width: 36,
                    height: 36,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentBlogData.author?.id) navigate(`${ROUTES.AUTHOR}/${currentBlogData.author.id}`);
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  fontSize="0.875rem"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentBlogData.author?.id) navigate(`${ROUTES.AUTHOR}/${currentBlogData.author.id}`);
                  }}
                >
                  {currentBlogData.author.name}
                </Typography>
              </Box>

              {/* Follow Button - Right after author name */}
              {currentBlogData.author?.id && !isPreviewMode && (
                <Box sx={{ flexShrink: 0 }}>
                  <FollowButton
                    authorId={currentBlogData.author.id}
                    authorName={currentBlogData.author.name || 'Unknown'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            {/* Metadata Row: Date, Reading Time, Favorite, Share */}
            <Box
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={{ xs: 1, sm: 2 }}
              sx={{ width: '100%' }}
            >
              {/* Date and Reading Time */}
              <Typography
                component={'div'}
                fontSize={'0.875rem'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexShrink: 0,
                  '& .text-gray': {
                    color: (theme) => theme.palette.customColors.neutral.gray.text,
                  },
                }}
              >
                <span className="text-gray">
                  {new Date(currentBlogData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-gray">•</span>
                <span className="text-gray">{currentBlogData.readingTime} min read</span>
              </Typography>

              {/* Favorite and Share */}
              <Box display="flex" gap={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {isAdmin && currentBlogData && !isPreviewMode && (
                  <Tooltip title={currentBlogData.isFeatured ? 'Unmark as Featured' : 'Mark as Featured'}>
                    <IconButton
                      onClick={handleToggleFeatured}
                      size="small"
                      sx={{
                        color: currentBlogData.isFeatured ? theme.palette.customColors.featured.highlight : 'text.secondary',
                        '&:hover': {
                          color: theme.palette.customColors.featured.highlight,
                          bgcolor: theme.palette.customColors.featured.highlightBg,
                        },
                      }}
                    >
                      {currentBlogData.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                {!isPreviewMode && <ShareButton blog={currentBlogData} size="medium" />}
              </Box>
            </Box>
            <Box height={{ xs: '15rem', sm: '23rem' }} maxWidth={'100%'} display={'flex'} justifyContent={'center'}>
              <img
                src={currentBlogData.selectedImage}
                alt={currentBlogData.topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </Box>

            {/* Audio Narration Player */}
            {(currentBlogData.audioNarrationUrl || currentBlogData.audioGenerationStatus === 'processing') && (
              <Box sx={{ my: 3 }}>
                {currentBlogData.audioGenerationStatus === 'processing' ? (
                  <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'info.lighter' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress size={24} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                          Audio is being generated...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This may take a minute. The page will update automatically when ready.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ) : currentBlogData.audioNarrationUrl ? (
                  <AudioPlayer
                    audioUrl={currentBlogData.audioNarrationUrl}
                    title={currentBlogData.title}
                    blogId={currentBlogData.id}
                  />
                ) : null}
              </Box>
            )}

            <Typography component={'div'} fontSize={{ sx: '1rem', sm: '1.1rem' }} textAlign={'left'}>
              <div dangerouslySetInnerHTML={{ __html: marked(currentBlogData.content) }} />
            </Typography>

            {/* Like/Dislike Section - Hidden in preview mode */}
            {!isPreviewMode && (
              <Box sx={{ my: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Was this article helpful?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <BlogLikeDislike blog={currentBlogData} size="large" showCounts />
                    <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', height: '40px', mx: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ShareButton blog={currentBlogData} size="large" />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Comment Section - Hidden in preview mode */}
            {!isPreviewMode && (
              <Box sx={{ my: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    Comments
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <CommentSection blogId={currentBlogData.id} />
                </Paper>
              </Box>
            )}
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
