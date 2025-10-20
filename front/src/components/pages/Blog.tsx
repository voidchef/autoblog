import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../elements/Common/NavBar';
import Footer from '../elements/Common/Footer';
import { Typography, Paper, Divider } from '@mui/material';
import Title from '../elements/Blog/Title';
import { marked } from 'marked';
import { useGetBlogQuery } from '../../services/blogApi';
import { useAppSelector } from '../../utils/reduxHooks';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import BlogLikeDislike from '../elements/BlogLikeDislike';
import CommentSection from '../elements/CommentSection';

export default function Blog() {
  const location = useLocation();
  const { preview } = useParams();
  const slug = location.pathname.split('/')[2];

  const { data: blogData, isLoading } = useGetBlogQuery(slug, {
    skip: !!preview // Skip query if in preview mode
  });

  // For preview mode, get data from Redux state
  const previewBlogData = useAppSelector((state) => state.blog.blogData);
  const currentBlogData = preview ? previewBlogData : blogData;

  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ gap: { xs: 2, sm: 5 } }}
        bgcolor={'#E9EAF4'}
      >
        <NavBar />
        <Title title={currentBlogData ? currentBlogData.category : 'Loading'} />
      </Box>
      <Box sx={{ my: 4 }} />
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{ marginX: { xs: '1rem', sm: '22rem' } }}
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
            <Typography component={'div'} fontSize={{ xs: '2rem', sm: '3rem' }} textAlign={'center'}>
              {currentBlogData.title}
            </Typography>
            <Box>
              <Typography component={'div'} fontSize={'1rem'} textAlign={'left'}>
                <span style={{ color: '#6D6E76' }}>By </span>
                <span style={{ color: '#555FAC', fontWeight: 700 }}>{currentBlogData.author?.name || 'Unknown'}</span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>
                  {new Date(currentBlogData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span style={{ color: '#6D6E76' }}> | </span>
                <span style={{ color: '#6D6E76' }}>{currentBlogData.readingTime} mins</span>
              </Typography>
            </Box>
            <Box height={{ xs: '15rem', sm: '23rem' }} maxWidth={'100%'} display={'flex'} justifyContent={'center'}>
              <img
                src={currentBlogData.selectedImage}
                alt={currentBlogData.topic}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
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
                  bgcolor: '#F5F6FA',
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: '#2C3E50',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Was this article helpful?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <BlogLikeDislike blog={currentBlogData} size="large" showCounts />
                </Box>
              </Paper>
            </Box>

            {/* Comment Section */}
            <Box sx={{ my: 4 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  border: '1px solid #E0E0E0'
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    color: '#2C3E50',
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
