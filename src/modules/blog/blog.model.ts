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
      trim: true,
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
    languageModel: {
      type: String,
      required: true,
      trim: true,
    },
    tone: {
      type: String,
      required: true,
      trim: true,
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
blogSchema.method('generateReadTime', function (content: string): number {
  const wordsPerMinute = 200;
  const numberOfWords = content.split(/\s/g).length;
  const readingTime = Math.ceil(numberOfWords / wordsPerMinute);
  return readingTime;
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
