const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Autoblog API',
    version: '1.0.0',
    description: `AI-powered blog post generation platform with automated content creation, image generation, audio narration, and SEO optimization.
    
Features:
- AI-powered blog generation using OpenAI GPT models
- Template-based blog generation with custom markdown templates
- Image generation with DALL-E
- Audio narration with Google Cloud Text-to-Speech
- Multi-platform publishing (WordPress, Medium)
- Comment system with nested replies
- Like/dislike functionality
- Contact form and message management
- OAuth integration (Google, Apple)
- User follow system
- Google Analytics integration
- SEO optimization tools`,
    license: {
      name: 'MIT',
      url: 'https://github.com/voidchef/autoblog/blob/main/LICENSE',
    },
    contact: {
      name: 'Neelutpal Saha',
      email: 'neelutpalsaha44@gmail.com',
      url: 'https://github.com/voidchef/autoblog',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Server (Root)',
    },
    {
      url: '/v1',
      description: 'Current Server (API v1)',
    },
  ],
  tags: [
    {
      name: 'System',
      description: 'System information and health check endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management and profile endpoints',
    },
    {
      name: 'Blogs',
      description: 'Blog post management, generation, and publishing endpoints',
    },
    {
      name: 'Comments',
      description: 'Comment system with nested replies',
    },
    {
      name: 'Contact',
      description: 'Contact form and message management',
    },
    {
      name: 'OAuth Connections',
      description: 'OAuth connection management for Google and Apple',
    },
    {
      name: 'AppSettings',
      description: 'Application settings and configuration',
    },
  ],
};

export default swaggerDefinition;
