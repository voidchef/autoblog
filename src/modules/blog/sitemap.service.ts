import { IBlogDoc } from './blog.interfaces';
import Blog from './blog.model';

export interface SitemapUrl {
  url: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

/**
 * Generate sitemap URLs for all published blogs
 * @param {string} baseUrl - The base URL of the website
 * @returns {Promise<SitemapUrl[]>}
 */
export const generateBlogSitemapUrls = async (baseUrl: string): Promise<SitemapUrl[]> => {
  const publishedBlogs = await Blog.find({ isPublished: true, isDraft: false })
    .select('slug updatedAt isFeatured')
    .sort({ updatedAt: -1 });

  return publishedBlogs.map((blog: IBlogDoc) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastmod: (blog.updatedAt
      ? blog.updatedAt.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]) as string,
    changefreq: 'weekly' as const,
    priority: blog.isFeatured ? 0.9 : 0.7,
  }));
};

/**
 * Generate XML sitemap content
 * @param {string} baseUrl - The base URL of the website
 * @returns {Promise<string>}
 */
export const generateSitemapXML = async (baseUrl: string): Promise<string> => {
  const blogUrls = await generateBlogSitemapUrls(baseUrl);

  // Add static pages
  const currentDate = new Date().toISOString().split('T')[0] as string;
  const staticUrls: SitemapUrl[] = [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/posts`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5,
    },
  ];

  const allUrls = [...staticUrls, ...blogUrls];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return xmlContent;
};

/**
 * Generate robots.txt content
 * @param {string} baseUrl - The base URL of the website
 * @returns {string}
 */
export const generateRobotsTxt = (baseUrl: string): string => {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /preview/
Disallow: /*.json$
Disallow: /*?*preview=true
`;
};
