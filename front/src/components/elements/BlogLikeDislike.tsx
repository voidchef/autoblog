import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { useLikeBlogMutation, useDislikeBlogMutation, IBlog } from '../../services/blogApi';
import { useAppSelector, useAppDispatch } from '../../utils/reduxHooks';
import * as analytics from '../../utils/analytics';
import { showError, showInfo } from '../../reducers/alert';

interface BlogLikeDislikeProps {
  blog: IBlog;
  size?: 'small' | 'medium' | 'large';
  showCounts?: boolean;
}

const BlogLikeDislike: React.FC<BlogLikeDislikeProps> = ({ 
  blog, 
  size = 'medium', 
  showCounts = true 
}) => {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const [likeBlog, { isLoading: isLiking }] = useLikeBlogMutation();
  const [dislikeBlog, { isLoading: isDisliking }] = useDislikeBlogMutation();

  const hasLiked = userId ? blog.likes.includes(userId) : false;
  const hasDisliked = userId ? blog.dislikes.includes(userId) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      dispatch(showInfo('Please log in to like this post'));
      return;
    }

    try {
      await likeBlog(blog.id).unwrap();
      
      // Track like event in Google Analytics
      analytics.trackBlogLike(blog.id, blog.title);
    } catch (error) {
      console.error('Failed to like blog:', error);
      dispatch(showError('Failed to like this post. Please try again.'));
    }
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      dispatch(showInfo('Please log in to dislike this post'));
      return;
    }

    try {
      await dislikeBlog(blog.id).unwrap();
      
      // Track dislike event in Google Analytics
      analytics.trackBlogDislike(blog.id, blog.title);
    } catch (error) {
      console.error('Failed to dislike blog:', error);
      dispatch(showError('Failed to dislike this post. Please try again.'));
    }
  };

  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Like Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={userId ? (hasLiked ? 'Unlike' : 'Like') : 'Login to like'}>
          <span>
            <IconButton
              size={size}
              onClick={handleLike}
              color={hasLiked ? 'primary' : 'default'}
              disabled={isLiking || !userId}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                },
              }}
            >
              <ThumbUp fontSize={iconSize} />
            </IconButton>
          </span>
        </Tooltip>
        {showCounts && (
          <Typography 
            variant={size === 'small' ? 'caption' : 'body2'} 
            color="text.secondary"
            fontWeight={hasLiked ? 'bold' : 'normal'}
          >
            {blog.likes.length}
          </Typography>
        )}
      </Box>

      {/* Dislike Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={userId ? (hasDisliked ? 'Remove dislike' : 'Dislike') : 'Login to dislike'}>
          <span>
            <IconButton
              size={size}
              onClick={handleDislike}
              color={hasDisliked ? 'error' : 'default'}
              disabled={isDisliking || !userId}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                },
              }}
            >
              <ThumbDown fontSize={iconSize} />
            </IconButton>
          </span>
        </Tooltip>
        {showCounts && (
          <Typography 
            variant={size === 'small' ? 'caption' : 'body2'} 
            color="text.secondary"
            fontWeight={hasDisliked ? 'bold' : 'normal'}
          >
            {blog.dislikes.length}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BlogLikeDislike;
