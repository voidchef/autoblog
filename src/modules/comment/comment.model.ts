import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { ICommentDoc, ICommentModel } from './comment.interfaces';

const commentSchema = new mongoose.Schema<ICommentDoc, ICommentModel>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
commentSchema.plugin(toJSON);
commentSchema.plugin(paginate);

// Override toJSON to preserve createdAt and updatedAt for comments
commentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    if (doc.createdAt) {
      ret.createdAt = doc.createdAt;
    }
    if (doc.updatedAt) {
      ret.updatedAt = doc.updatedAt;
    }
    return ret;
  },
});

/**
 * Toggle like on comment
 * @param {mongoose.Types.ObjectId} userId
 */
commentSchema.method('toggleLike', async function (this: ICommentDoc, userId: mongoose.Types.ObjectId): Promise<void> {
  const userIdString = userId.toString();
  const likeIndex = this.likes.findIndex((id) => id.toString() === userIdString);
  const dislikeIndex = this.dislikes.findIndex((id) => id.toString() === userIdString);

  // Remove from dislikes if present
  if (dislikeIndex !== -1) {
    this.dislikes.splice(dislikeIndex, 1);
  }

  // Toggle like
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }

  await this.save();
});

/**
 * Toggle dislike on comment
 * @param {mongoose.Types.ObjectId} userId
 */
commentSchema.method(
  'toggleDislike',
  async function (this: ICommentDoc, userId: mongoose.Types.ObjectId): Promise<void> {
    const userIdString = userId.toString();
    const likeIndex = this.likes.findIndex((id) => id.toString() === userIdString);
    const dislikeIndex = this.dislikes.findIndex((id) => id.toString() === userIdString);

    // Remove from likes if present
    if (likeIndex !== -1) {
      this.likes.splice(likeIndex, 1);
    }

    // Toggle dislike
    if (dislikeIndex === -1) {
      this.dislikes.push(userId);
    } else {
      this.dislikes.splice(dislikeIndex, 1);
    }

    await this.save();
  }
);

const Comment = mongoose.model<ICommentDoc, ICommentModel>('Comment', commentSchema);

export default Comment;
