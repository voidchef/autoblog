import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Typography, Paper, Divider, Button } from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import Title from '../elements/Blog/Title';
import { marked } from 'marked';
import { useGetBlogQuery, useGenerateAudioNarrationMutation, IBlog as IBlogAPI } from '../../services/blogApi';
import { useAppSelector } from '../../utils/reduxHooks';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BlogLikeDislike from '../elements/BlogLikeDislike';
import CommentSection from '../elements/CommentSection';
import ShareButton from '../elements/ShareButton';
import FollowButton from '../elements/FollowButton';
import AudioPlayer from '../elements/AudioPlayer';
import { ROUTES } from '../../utils/routing/routes';
import * as analytics from '../../utils/analytics';

export default function Blog() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preview } = useParams();
  const slug = location.pathname.split('/')[2];

  const { data: blogData, isLoading } = useGetBlogQuery(slug, {
    skip: !!preview // Skip query if in preview mode
  });

  // For preview mode, get data from Redux state
  const previewBlogData = useAppSelector((state) => state.blog.blogData);
  const currentBlogData = (preview ? previewBlogData : blogData) as IBlogAPI | null;

  // Track blog view when blog loads (only for non-preview mode)
  React.useEffect(() => {
    if (!preview && currentBlogData && analytics.isGAInitialized()) {
      analytics.trackBlogView(
        currentBlogData.id,
        currentBlogData.title,
        currentBlogData.category
      );
    }
  }, [preview, currentBlogData?.id]);

  // Audio narration mutation
  const [generateAudio, { isLoading: isGeneratingAudio }] = useGenerateAudioNarrationMutation();

  const handleGenerateAudio = async () => {
    if (currentBlogData?.id) {
      try {
        await generateAudio(currentBlogData.id).unwrap();
      } catch (error) {
        console.error('Failed to generate audio:', error);
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
          bgcolor: (theme) => theme.palette.mode === 'dark' 
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
        {isLoading && !preview ? (
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
              {currentBlogData.tags && currentBlogData.tags.map((tag: string, index: number) => (
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
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  "headline": currentBlogData.title,
                  "description": currentBlogData.seoDescription,
                  "image": currentBlogData.selectedImage,
                  "author": {
                    "@type": "Person",
                    "name": currentBlogData.author?.name
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "AutoBlog",
                    "logo": {
                      "@type": "ImageObject",
                      "url": `${window.location.origin}/vite.svg`
                    }
                  },
                  "datePublished": new Date(currentBlogData.createdAt).toISOString(),
                  "dateModified": new Date(currentBlogData.updatedAt).toISOString(),
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": window.location.href
                  },
                  "keywords": currentBlogData.tags?.join(', '),
                  "wordCount": currentBlogData.content?.split(/\s+/).length,
                  "timeRequired": `PT${currentBlogData.readingTime}M`
                })}
              </script>
            </Helmet>
            <Typography component={'div'} fontSize={{ xs: '1.75rem', sm: '2.5rem', md: '3rem' }} textAlign={'center'} fontWeight={700}>
              {currentBlogData.title}
            </Typography>
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'}>
              <Box display={'flex'} alignItems={'center'} gap={2} flexWrap={'wrap'}>
                <Typography 
                  component={'div'} 
                  fontSize={'1rem'} 
                  textAlign={'left'}
                  sx={{
                    '& .text-gray': {
                      color: (theme) => theme.palette.customColors.neutral.gray.text,
                    },
                    '& .text-primary': {
                      color: 'primary.main',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    },
                  }}
                >
                  <span className="text-gray">By </span>
                  <span 
                    className="text-primary"
                    onClick={() => currentBlogData.author?.id && navigate(`${ROUTES.AUTHOR}/${currentBlogData.author.id}`)}
                  >
                    {currentBlogData.author?.name || 'Unknown'}
                  </span>
                  <span className="text-gray"> | </span>
                  <span className="text-gray">
                    {new Date(currentBlogData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-gray"> | </span>
                  <span className="text-gray">{currentBlogData.readingTime} mins</span>
                </Typography>
                {currentBlogData.author?.id && (
                  <FollowButton 
                    authorId={currentBlogData.author.id} 
                    authorName={currentBlogData.author.name || 'Unknown'}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box>
                <ShareButton blog={currentBlogData} size="medium" />
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
            <Box sx={{ my: 3 }}>
              {currentBlogData.audioNarrationUrl ? (
                <AudioPlayer 
                  audioUrl={currentBlogData.audioNarrationUrl}
                  title={currentBlogData.title}
                  blogId={currentBlogData.id}
                  loading={isGeneratingAudio || currentBlogData.audioGenerationStatus === 'processing'}
                />
              ) : (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <VolumeUpIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Listen to this article
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VolumeUpIcon />}
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio || currentBlogData.audioGenerationStatus === 'processing'}
                    >
                      {isGeneratingAudio || currentBlogData.audioGenerationStatus === 'processing' 
                        ? 'Generating...' 
                        : 'Generate Audio'}
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>

            <Typography component={'div'} fontSize={{ sx: '1rem', sm: '1.1rem' }} textAlign={'left'}>
              <div dangerouslySetInnerHTML={{ __html: marked(currentBlogData.content) }} />
            </Typography>

            {/* Like/Dislike Section */}
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
                    mb: 2
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

            {/* Comment Section */}
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
                    mb: 3
                  }}
                >
                  Comments
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <CommentSection blogId={currentBlogData.id} />
              </Paper>
            </Box>
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
