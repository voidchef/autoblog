import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
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
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

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
  return excerpt.substring(0, lastSpace) + '...';
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
