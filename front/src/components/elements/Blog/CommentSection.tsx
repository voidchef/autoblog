import { FC, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../utils/reduxHooks';
import { useGetCommentsByBlogQuery, useCreateCommentMutation } from '../../../services/commentApi';
import { CommentsHeader, NewCommentForm, CommentItem, EmptyComments } from '../Comments';
import { showSuccess, showError } from '../../../reducers/alert';

interface CommentSectionProps {
  blogId: string;
}

const CommentSection: FC<CommentSectionProps> = ({ blogId }) => {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const [newComment, setNewComment] = useState('');

  const {
    data: commentsData,
    isLoading,
    error,
  } = useGetCommentsByBlogQuery({
    blogId,
    sortBy: 'createdAt:desc',
    limit: 50,
  });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment({
        content: newComment,
        blog: blogId,
      }).unwrap();
      setNewComment('');
      dispatch(showSuccess('Comment posted successfully!'));
    } catch (error) {
      console.error('Failed to create comment:', error);
      dispatch(showError('Failed to post comment. Please try again.'));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load comments. Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <CommentsHeader count={commentsData?.totalResults || 0} />

      {/* New Comment Form */}
      {userId ? (
        <NewCommentForm
          comment={newComment}
          isCreating={isCreating}
          onCommentChange={setNewComment}
          onSubmit={handleSubmitComment}
        />
      ) : (
        <Alert
          severity="info"
          sx={{
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          Please log in to join the conversation
        </Alert>
      )}

      {/* Comments List */}
      {commentsData?.results.map((comment, index) => (
        <Box key={comment.id} sx={{ animationDelay: `${index * 50}ms` }}>
          <CommentItem comment={comment} blogId={blogId} />
        </Box>
      ))}

      {/* Empty State */}
      {commentsData?.results.length === 0 && <EmptyComments />}
    </Box>
  );
};

export default CommentSection;
