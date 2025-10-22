import * as React from 'react';
import { Box, TextField, Paper, Typography, InputAdornment, Chip } from '@mui/material';
import { 
  Title as TitleIcon,
  Article as ArticleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface BlogContentFieldsProps {
  blogTitle: string;
  blogContent: string;
  isEditMode: boolean;
  disabled?: boolean;
  onBlogTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlogContentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogContentFields({
  blogTitle,
  blogContent,
  isEditMode,
  disabled = false,
  onBlogTitleChange,
  onBlogContentChange,
}: BlogContentFieldsProps) {
  const wordCount = blogContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = blogContent.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <Box sx={{ flexGrow: 1, marginX: { xs: '1rem', sm: '7rem' } }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Content Editor
            </Typography>
          </Box>
          
          {blogContent && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${wordCount} words`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`${readingTime} min read`} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        <Box display={'flex'} flexDirection={'column'} sx={{ gap: 3 }}>
          <TextField
            fullWidth
            id="post-title-required"
            label="Post Title"
            value={blogTitle}
            disabled={blogTitle !== '' ? false : true || disabled}
            required={isEditMode}
            onChange={onBlogTitleChange}
            placeholder="Enter a captivating title..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 500,
              },
            }}
          />
          
          {!blogContent && !disabled && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <InfoIcon fontSize="small" color="info" />
              <Typography variant="body2" color="text.secondary">
                {isEditMode 
                  ? "Edit your blog content below. Changes will be saved to draft."
                  : "Fill in the configuration and click 'Generate with AI' to create content automatically!"
                }
              </Typography>
            </Box>
          )}
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <ArticleIcon fontSize="small" sx={{ color: 'secondary.main' }} />
            <Typography variant="body2" color="text.secondary">
              <strong style={{ color: 'inherit', fontWeight: 600 }}>Note:</strong> Content should be written in{' '}
              <Typography
                component="span"
                sx={{
                  color: 'secondary.main',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                Markdown
              </Typography>
              {' '}format for proper formatting and styling.
            </Typography>
          </Box>
          
          <TextField
            id="outlined-multiline-static"
            label="Blog Content"
            value={blogContent}
            disabled={blogTitle !== '' ? false : true || disabled}
            required={isEditMode}
            multiline
            rows={30}
            placeholder="Your AI-generated content will appear here, or start writing manually..."
            fullWidth
            onChange={onBlogContentChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontFamily: 'inherit',
                lineHeight: 1.8,
              },
              '& textarea': {
                fontSize: '1rem',
              },
            }}
          />
          
          {blogContent && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {charCount} characters • {wordCount} words • ~{readingTime} min read
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Looking good! 🎉
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
