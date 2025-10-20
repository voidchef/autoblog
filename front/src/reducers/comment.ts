import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommentState {
  activeCommentId: string | null;
  replyingToCommentId: string | null;
  editingCommentId: string | null;
  showRepliesForCommentId: string | null;
}

const initialState: CommentState = {
  activeCommentId: null,
  replyingToCommentId: null,
  editingCommentId: null,
  showRepliesForCommentId: null,
};

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    setActiveComment: (state, action: PayloadAction<string | null>) => {
      state.activeCommentId = action.payload;
    },
    setReplyingToComment: (state, action: PayloadAction<string | null>) => {
      state.replyingToCommentId = action.payload;
      if (action.payload) {
        state.editingCommentId = null; // Can't reply and edit at the same time
      }
    },
    setEditingComment: (state, action: PayloadAction<string | null>) => {
      state.editingCommentId = action.payload;
      if (action.payload) {
        state.replyingToCommentId = null; // Can't edit and reply at the same time
      }
    },
    toggleShowReplies: (state, action: PayloadAction<string | null>) => {
      if (state.showRepliesForCommentId === action.payload) {
        state.showRepliesForCommentId = null;
      } else {
        state.showRepliesForCommentId = action.payload;
      }
    },
    clearCommentState: (state) => {
      state.activeCommentId = null;
      state.replyingToCommentId = null;
      state.editingCommentId = null;
      state.showRepliesForCommentId = null;
    },
  },
});

export const {
  setActiveComment,
  setReplyingToComment,
  setEditingComment,
  toggleShowReplies,
  clearCommentState,
} = commentSlice.actions;

export default commentSlice.reducer;
