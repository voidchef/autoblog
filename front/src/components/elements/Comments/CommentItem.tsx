import { FC, MouseEvent, useState } from 'react';
import { Box, Typography, Paper, Fade, Divider } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../utils/reduxHooks';
import { setReplyingToComment, setEditingComment, toggleShowReplies } from '../../../reducers/comment';
import { showSuccess, showError } from '../../../reducers/alert';
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useDislikeCommentMutation,
  useCreateCommentMutation,
  useGetRepliesQuery,
  IComment,
} from '../../../services/commentApi';
import CommentHeader from './CommentHeader';
import CommentActions from './CommentActions';
import CommentEditForm from './CommentEditForm';
import CommentReplyForm from './CommentReplyForm';

interface CommentItemProps {
  comment: IComment;
  blogId: string;
  isReply?: boolean;
}

const CommentItem: FC<CommentItemProps> = ({ comment, blogId, isReply = false }) => {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const { replyingToCommentId, editingCommentId, showRepliesForCommentId } = useAppSelector((state) => state.comment);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');

  const [likeComment] = useLikeCommentMutation();
  const [dislikeComment] = useDislikeCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [createComment] = useCreateCommentMutation();

  // Fetch replies if this is a parent comment (not a reply itself)
  // We always fetch to get the count, but only display when showReplies is true
  const { data: repliesData } = useGetRepliesQuery(
    { commentId: comment.id, sortBy: 'createdAt:asc' },
    { skip: isReply }, // Skip fetching replies for nested comments (replies to replies)
  );

  const isOwner = userId === comment.author.id;
  const hasLiked = userId ? comment.likes.includes(userId) : false;
  const hasDisliked = userId ? comment.dislikes.includes(userId) : false;
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const showReplies = showRepliesForCommentId === comment.id;

  // Handler functions
  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLike = async () => {
    try {
      await likeComment(comment.id).unwrap();
    } catch (error) {
      console.error('Failed to like comment:', error);
      dispatch(showError('Failed to like comment. Please try again.'));
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeComment(comment.id).unwrap();
    } catch (error) {
      console.error('Failed to dislike comment:', error);
      dispatch(showError('Failed to dislike comment. Please try again.'));
    }
  };

  const handleEdit = () => {
    dispatch(setEditingComment(comment.id));
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    dispatch(setEditingComment(null));
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    try {
      await updateComment({ id: comment.id, data: { content: editContent } }).unwrap();
      dispatch(setEditingComment(null));
      dispatch(showSuccess('Comment updated successfully!'));
    } catch (error) {
      console.error('Failed to update comment:', error);
      dispatch(showError('Failed to update comment. Please try again.'));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.id).unwrap();
        handleMenuClose();
        dispatch(showSuccess('Comment deleted successfully!'));
      } catch (error) {
        console.error('Failed to delete comment:', error);
        dispatch(showError('Failed to delete comment. Please try again.'));
      }
    }
  };

  const handleReply = () => {
    dispatch(setReplyingToComment(comment.id));
    setReplyContent('');
  };

  const handleCancelReply = () => {
    dispatch(setReplyingToComment(null));
    setReplyContent('');
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await createComment({
        content: replyContent,
        blog: blogId,
        parentComment: comment.id,
      }).unwrap();
      setReplyContent('');
      dispatch(setReplyingToComment(null));
      dispatch(toggleShowReplies(comment.id));
      dispatch(showSuccess('Reply posted successfully!'));
    } catch (error) {
      console.error('Failed to create reply:', error);
      dispatch(showError('Failed to post reply. Please try again.'));
    }
  };

  const handleToggleReplies = () => {
    dispatch(toggleShowReplies(comment.id));
  };

  // Deleted comment display
  if (comment.isDeleted) {
    return (
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          ml: isReply ? 6 : 0,
          bgcolor: 'action.disabledBackground',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          💬 This comment has been deleted
        </Typography>
      </Paper>
    );
  }

  return (
    <Fade in timeout={300}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          ml: isReply ? 6 : 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 3,
            borderColor: 'primary.light',
          },
        }}
      >
        {/* Row 1: Header */}
        <CommentHeader
          authorName={comment.author.name!}
          createdAt={comment.createdAt}
          updatedAt={comment.updatedAt}
          isOwner={isOwner}
          anchorEl={anchorEl}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Row 2: Comment Body */}
        {!isEditing && (
          <Typography
            variant="body1"
            sx={{
              mb: 2.5,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: 'text.primary',
              textAlign: 'left',
            }}
          >
            {comment.content}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Row 3: Actions */}
        <CommentActions
          hasLiked={hasLiked}
          hasDisliked={hasDisliked}
          likesCount={comment.likes.length}
          dislikesCount={comment.dislikes.length}
          repliesCount={repliesData?.totalResults}
          showReplies={showReplies}
          isReply={isReply}
          userId={userId}
          onLike={handleLike}
          onDislike={handleDislike}
          onReply={handleReply}
          onToggleReplies={handleToggleReplies}
        />

        {/* Row 4: Edit Form */}
        {isEditing && (
          <CommentEditForm
            content={editContent}
            onContentChange={setEditContent}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Row 4: Reply Form */}
        {isReplying && (
          <CommentReplyForm
            content={replyContent}
            onContentChange={setReplyContent}
            onSubmit={handleSubmitReply}
            onCancel={handleCancelReply}
          />
        )}

        {/* Replies */}
        {showReplies && repliesData && repliesData.results.length > 0 && (
          <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '2px solid', borderColor: 'divider' }}>
            {repliesData.results.map((reply) => (
              <CommentItem key={reply.id} comment={reply} blogId={blogId} isReply />
            ))}
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default CommentItem;
