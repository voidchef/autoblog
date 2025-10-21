import * as React from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useFollowUserMutation, useUnfollowUserMutation } from '../../services/userApi';
import { useAppSelector } from '../../utils/reduxHooks';

interface FollowButtonProps {
  authorId: string;
  authorName: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  authorId, 
  authorName,
  size = 'small',
  variant = 'outlined'
}) => {
  const { userId } = useAppSelector((state) => state.auth);
  const { userData } = useAppSelector((state) => state.user);
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();
  
  // Check if current user is following this author
  const isFollowingAuthor = React.useMemo(() => {
    return userData?.following?.includes(authorId) || false;
  }, [userData, authorId]);

  // Don't show follow button if not logged in or if it's the user's own post
  if (!userId || userId === authorId) {
    return null;
  }

  const handleFollowToggle = async () => {
    try {
      if (isFollowingAuthor) {
        await unfollowUser(authorId).unwrap();
      } else {
        await followUser(authorId).unwrap();
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };

  const isLoading = isFollowing || isUnfollowing;

  return (
    <Tooltip title={isFollowingAuthor ? `Unfollow ${authorName}` : `Follow ${authorName}`}>
      <Button
        onClick={handleFollowToggle}
        disabled={isLoading}
        size={size}
        variant={variant}
        color={isFollowingAuthor ? 'secondary' : 'primary'}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} />
          ) : isFollowingAuthor ? (
            <PersonRemoveIcon />
          ) : (
            <PersonAddIcon />
          )
        }
        sx={{
          minWidth: '100px',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {isFollowingAuthor ? 'Following' : 'Follow'}
      </Button>
    </Tooltip>
  );
};

export default FollowButton;
