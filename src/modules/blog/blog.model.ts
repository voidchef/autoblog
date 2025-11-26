import mongoose from 'mongoose';
import paginate from '../paginate/paginate';
import toJSON from '../toJSON/toJSON';
import { IBlogDoc, IBlogModel } from './blog.interfaces';

const blogSchema = new mongoose.Schema<IBlogDoc, IBlogModel>(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    seoTitle: {
      type: String,
      required: true,
      trim: true,
    },
    seoDescription: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readingTime: {
      type: Number,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      trim: true,
    },
    intent: {
      type: String,
      trim: true,
    },
    audience: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    llmModel: {
      type: String,
      required: true,
      trim: true,
    },
    generatedImages: {
      type: [String],
    },
    selectedImage: {
      type: String,
    },
    audioNarrationUrl: {
      type: String,
    },
    audioGenerationStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
    },
    generationStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    generationError: {
      type: String,
    },
    // WordPress publishing fields
    wordpressPostId: {
      type: Number,
    },
    wordpressPostUrl: {
      type: String,
    },
    wordpressPublishStatus: {
      type: String,
      enum: ['pending', 'published', 'failed'],
    },
    wordpressPublishedAt: {
      type: Date,
    },
    // Medium publishing fields
    mediumPostId: {
      type: String,
    },
    mediumPostUrl: {
      type: String,
    },
    mediumPublishStatus: {
      type: String,
      enum: ['pending', 'published', 'failed'],
    },
    mediumPublishedAt: {
      type: Date,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for excerpt
blogSchema.virtual('excerpt').get(function (this: IBlogDoc) {
  return this.generateExcerpt();
});

// add plugin that converts mongoose to json
blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

// Override toJSON to preserve createdAt and updatedAt for blog posts
blogSchema.set('toJSON', {
  virtuals: true,
  transform(doc: any, ret: any) {
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
 * Generate Reading Time
 * @param {string} content
 * @returns {number}
 */
blogSchema.method('generateReadTime', function (this: IBlogDoc, content: string): number {
  const wordsPerMinute = 200;
  const numberOfWords = content.split(/\s/g).length;
  const readingTime = Math.ceil(numberOfWords / wordsPerMinute);
  return readingTime;
});

/**
 * Generate SEO-friendly excerpt from content
 * @param {number} maxLength - Maximum length of excerpt (default: 160)
 * @returns {string}
 */
blogSchema.method('generateExcerpt', function (this: IBlogDoc, maxLength: number = 160): string {
  // Remove markdown and HTML tags, then create excerpt
  const cleanContent = this.content
    .replace(/#{1,6}\s?/g, '') // Remove markdown headers
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const excerpt = cleanContent.substring(0, maxLength);
  const lastSentence = excerpt.lastIndexOf('.');

  if (lastSentence > maxLength * 0.7) {
    return excerpt.substring(0, lastSentence + 1);
  }

  // If no good sentence break, cut at word boundary
  const lastSpace = excerpt.lastIndexOf(' ');
  return `${excerpt.substring(0, lastSpace)}...`;
});

/**
 * Toggle like on blog
 * @param {mongoose.Types.ObjectId} userId
 */
blogSchema.method('toggleLike', async function (this: IBlogDoc, userId: mongoose.Types.ObjectId): Promise<void> {
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
 * Toggle dislike on blog
 * @param {mongoose.Types.ObjectId} userId
 */
blogSchema.method('toggleDislike', async function (this: IBlogDoc, userId: mongoose.Types.ObjectId): Promise<void> {
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
});

blogSchema.pre('save', async function (next) {
  const blog = this;
  if (blog.isModified('content')) {
    blog.readingTime = blog.generateReadTime(blog.content);
  }
  next();
});

const Blog = mongoose.model<IBlogDoc, IBlogModel>('Blog', blogSchema);

export default Blog;
