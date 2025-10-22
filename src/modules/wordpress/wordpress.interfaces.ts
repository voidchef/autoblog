export interface IWordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface IWordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

export interface IWordPressPublishResponse {
  id: number;
  link: string;
  status: string;
  title: {
    rendered: string;
  };
}

export interface IWordPressMedia {
  id: number;
  source_url: string;
  title: {
    rendered: string;
  };
}

export interface IWordPressCategoryTag {
  id: number;
  name: string;
  slug: string;
}
