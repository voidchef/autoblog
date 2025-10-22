export interface IMediumConfig {
  integrationToken: string;
}

export interface IMediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface IMediumPost {
  title: string;
  content: string;
  contentFormat: 'html' | 'markdown';
  tags?: string[];
  canonicalUrl?: string;
  publishStatus?: 'public' | 'draft' | 'unlisted';
  license?: 'all-rights-reserved' | 'cc-40-by' | 'cc-40-by-sa' | 'cc-40-by-nd' | 'cc-40-by-nc' | 'cc-40-by-nc-nd' | 'cc-40-by-nc-sa' | 'cc-40-zero' | 'public-domain';
  notifyFollowers?: boolean;
}

export interface IMediumPublishResponse {
  id: string;
  title: string;
  authorId: string;
  url: string;
  canonicalUrl?: string;
  publishStatus: string;
  publishedAt?: number;
  license: string;
  licenseUrl: string;
  tags?: string[];
}

export interface IMediumApiResponse<T> {
  data: T;
}
