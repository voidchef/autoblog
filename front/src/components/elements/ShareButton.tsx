import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { IBlog } from '../../services/blogApi';
import * as analytics from '../../utils/analytics';
import { useAppDispatch } from '../../utils/reduxHooks';
import { showSuccess, showError } from '../../reducers/alert';

interface ShareButtonProps {
  blog: IBlog;
  size?: 'small' | 'medium' | 'large';
}

const ShareButton: React.FC<ShareButtonProps> = ({ blog, size = 'medium' }) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const shareUrl = window.location.href;
  const shareTitle = blog.title;
  const shareText = blog.seoDescription || blog.title;

  // Check if native share is available (typically on mobile devices)
  const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share;

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Use native share API if available
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        dispatch(showSuccess('Shared successfully!'));
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to menu on error
          setAnchorEl(e.currentTarget);
        }
      }
    } else {
      // Show menu for desktop
      setAnchorEl(e.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      dispatch(showSuccess('Link copied to clipboard!'));
      
      // Track share event
      analytics.trackBlogShare(blog.id, blog.title, 'copy_link');
      
      handleClose();
    } catch (error) {
      console.error('Failed to copy link:', error);
      dispatch(showError('Failed to copy link'));
    }
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareTitle
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    // Track share event
    analytics.trackBlogShare(blog.id, blog.title, 'twitter');
    
    handleClose();
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    
    // Track share event
    analytics.trackBlogShare(blog.id, blog.title, 'facebook');
    
    handleClose();
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    
    // Track share event
    analytics.trackBlogShare(blog.id, blog.title, 'linkedin');
    
    handleClose();
  };

  const handleShareEmail = () => {
    const emailSubject = encodeURIComponent(shareTitle);
    const emailBody = encodeURIComponent(`Check out this article: ${shareTitle}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    
    // Track share event
    analytics.trackBlogShare(blog.id, blog.title, 'email');
    
    handleClose();
  };

  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <>
      <Tooltip title="Share this article">
        <IconButton
          size={size}
          onClick={handleShare}
          sx={{
            color: 'primary.main',
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
              bgcolor: 'action.hover',
            },
          }}
        >
          <ShareIcon fontSize={iconSize} />
        </IconButton>
      </Tooltip>

      {/* Share Menu for Desktop */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShareTwitter}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" sx={{ color: (theme) => theme.palette.customColors.social.twitter }} />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShareFacebook}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" sx={{ color: (theme) => theme.palette.customColors.social.facebook }} />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShareLinkedIn}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" sx={{ color: (theme) => theme.palette.customColors.social.linkedin }} />
          </ListItemIcon>
          <ListItemText>Share on LinkedIn</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShareEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via Email</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ShareButton;
