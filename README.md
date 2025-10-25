# Autoblog 🤖✍️

> AI-powered blog post generation platform with automated content creation, image generation, and SEO optimization

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Automated Blog Writing**: Generate high-quality blog posts using OpenAI's GPT models
- **Content Templates**: Support for different blog formats and styles
- **SEO Optimization**: Built-in SEO analysis and optimization suggestions
- **Multi-Language Support**: Generate content in multiple languages

### 🎨 Image Generation
- **AI Image Creation**: Generate relevant images using OpenAI's DALL-E
- **Multiple Formats**: Support for various image sizes and styles
- **Automatic Upload**: Images are automatically uploaded to AWS S3
- **Smart Selection**: Automatically select the best image for each post

### 🎙️ Audio Narration
- **Text-to-Speech**: Convert blog posts to natural-sounding audio using Google Cloud TTS
- **High-Quality Voices**: WaveNet voices for professional audio narration
- **Audio Player**: Full-featured player with play/pause, volume control, and playback speed
- **On-Demand Generation**: Generate audio narration when needed
- **AWS S3 Storage**: Audio files stored and delivered via CDN

### 📊 Analytics & Insights
- **Google Analytics Integration**: Track performance and engagement with GA4
- **Content Analytics**: Monitor post performance and reader behavior
- **Engagement Metrics**: Track views, likes, dislikes, and comments
- **SEO Metrics**: Track search engine optimization effectiveness
- **User-Specific Stats**: View engagement statistics for your own blog posts

### 🔐 User Management
- **JWT Authentication**: Secure user authentication with JWT tokens
- **Role-Based Access**: Different permission levels for users (admin, user)
- **Profile Management**: User profiles with customizable settings
- **Follow System**: Users can follow and unfollow other users
- **API Key Management**: Secure storage of user API keys
- **Email Verification**: Optional email verification for new accounts
- **Password Reset**: Secure password reset via email

### 🌐 Modern Web Interface
- **React Frontend**: Modern, responsive React application
- **Material-UI**: Beautiful, consistent UI components
- **Dark/Light Theme**: Toggle between dark and light modes
- **Mobile Responsive**: Optimized for all device sizes

### 💬 Social Engagement
- **Comments System**: Full-featured commenting with nested replies
  - Create, edit, and delete comments
  - Nested comment threading for conversations
  - User authentication and ownership validation
  - Real-time updates with optimistic UI
- **Like/Dislike**: Engagement features for blogs and comments
  - Like/dislike blog posts
  - Like/dislike individual comments
  - Real-time count display
  - Mutually exclusive actions (like removes dislike)
- **Interactive UI**: Smooth, responsive user interactions
  - Expandable/collapsible reply threads
  - Inline editing and deletion
  - Loading states and error handling
  - Mobile-friendly touch interactions

### � Contact Management
- **Contact Form**: Public contact form for visitor inquiries
  - Email validation and confirmation
  - Query type categorization
  - Status tracking (new, in-progress, resolved)
  - Admin dashboard for message management
- **Query Types**: Customizable inquiry categories
  - Support, feedback, sales, and custom types
  - Admin-managed query type configuration
  - Active/inactive status control

### 🔗 OAuth Integration
- **Multi-Provider Authentication**: Connect accounts with OAuth providers
  - Google OAuth integration
  - Apple Sign-In support
- **Connection Management**: Manage connected OAuth accounts
  - View all connected accounts
  - Token refresh and renewal
  - Connection status monitoring
  - Unlink accounts when needed

### �🚀 Multi-Platform Publishing
- **WordPress Integration**: Publish directly to WordPress sites via REST API
  - One-click publishing to connected WordPress sites
  - Automatic formatting and media handling
  - Support for custom WordPress installations
- **Medium Publishing**: Export and publish to Medium platform
  - Direct API integration with Medium
  - Automatic content formatting for Medium
  - Maintain author attribution and links

## 🛠️ Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **LangChain** - AI/LLM integration
- **OpenAI API** - Content and image generation
- **Google Cloud Text-to-Speech** - Audio narration
- **AWS S3** - File and audio storage
- **Google Analytics Data API** - Analytics integration
- **WordPress REST API** - WordPress publishing
- **Medium API** - Medium publishing
- **PM2** - Process management
- **Swagger/OpenAPI** - API documentation

### Frontend
- **React** 19+ with TypeScript
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Vite** - Build tool
- **Axios** - HTTP client

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container deployment
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB database
- OpenAI API key
- AWS account (for S3 storage)

## 🐳 Docker Installation (Recommended)

The easiest way to get started is using Docker. See [DOCKER.md](./DOCKER.md) for comprehensive Docker documentation.

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/voidchef/autoblog.git
   cd autoblog
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker**
   ```bash
   # Development mode (with hot reload)
   make dev
   # or
   pnpm docker:dev
   
   # Production mode
   make prod
   # or
   pnpm docker:prod
   ```

4. **Access the application**
   - Frontend: http://localhost:5173 (dev) or http://localhost:3000 (prod)
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27018

### Docker Commands

```bash
make help              # Show all available commands
make dev               # Start development environment
make prod              # Start production environment
make test              # Run tests in Docker
make logs              # View logs
make shell             # Open shell in container
make db-shell          # Open MongoDB shell
make clean             # Clean up containers
```

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation including:
- Multi-stage builds
- Development vs Production configurations
- Database management
- Troubleshooting
- CI/CD integration

## 💻 Local Installation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/voidchef/autoblog.git
   cd autoblog
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/autoblog
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=http://localhost:5173
   SERVER_URL=http://localhost:3000
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_BUCKET_NAME=your-s3-bucket
   
   # Google Cloud Text-to-Speech (for audio narration)
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
   
   # Google Analytics (optional)
   GA_PROPERTY_ID=your-property-id
   GA_KEY_FILENAME=./service-account.json
   
   # OAuth Configuration (optional)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   APPLE_CLIENT_ID=com.yourapp.service
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_KEY_ID=YOUR_KEY_ID
   APPLE_PRIVATE_KEY_PATH=./AuthKey_YOUR_KEY_ID.p8
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@autoblog.com
   ```

4. **Start development servers**
   ```bash
   # Start both backend and frontend in development mode
   pnpm dev
   
   # Or start them separately:
   pnpm server  # Backend only
   pnpm front   # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/v1/docs

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at `/v1/docs` when the server is running.

### Key Endpoints

- **Authentication**: `/v1/auth/*`
  - Register, login, logout, refresh tokens
  - Password reset and email verification
  
- **Blog Management**: `/v1/blogs/*`
  - CRUD operations for blog posts
  - AI-powered blog generation
  - Publish/unpublish, featured toggle
  - Like/dislike functionality
  - Engagement statistics
  - Search and filtering
  
- **Audio Narration**: `/v1/blogs/:id/audio`
  - Generate text-to-speech audio
  - Get audio status and URL
  
- **Publishing**: `/v1/blogs/:id/publish-*`
  - Publish to WordPress
  - Publish to Medium
  
- **Comments**: `/v1/comments/*`
  - Create, read, update, delete comments
  - Nested reply support
  - Like/dislike comments
  
- **User Management**: `/v1/users/*`
  - User profile management
  - Role and permission management

- **Contact**: `/v1/contact/*`
  - Submit contact messages (public)
  - Manage contact inquiries (admin)
  - Query type management

- **OAuth Connections**: `/v1/oauth-connections/*`
  - View connected OAuth accounts
  - Refresh OAuth tokens
  - Unlink OAuth connections
  
- **App Settings**: `/v1/app-settings/*`
  - Manage categories
  - Configure application settings

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Testing
```bash
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm coverage

# Run TypeScript tests only
pnpm test:ts

# Run JavaScript tests only
pnpm test:js
```

## 📝 Development

### Code Quality
```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm prettier:fix

# Type checking
pnpm compile
```

### Git Workflow
This project uses conventional commits and automated versioning:

```bash
# Stage and commit with conventional commit format
pnpm commit

# Create a new release
pnpm release
```

## 🌟 Key Features Explained

### AI Blog Generation Process
1. **Topic Input**: User provides a topic or keyword
2. **Content Planning**: AI creates a structured outline
3. **Content Generation**: AI writes the full blog post with proper formatting
4. **SEO Optimization**: AI optimizes content for search engines
5. **Image Generation**: AI creates relevant images using DALL-E
6. **Review & Edit**: User can review and make final adjustments

### Content Templates
- **Technical Articles**: In-depth technical tutorials and guides
- **How-to Guides**: Step-by-step instructional content
- **Opinion Pieces**: Thought leadership and opinion articles
- **News Updates**: Current events and industry news
- **Product Reviews**: Detailed product analysis and reviews

### SEO Features
- **Keyword Optimization**: Automatic keyword integration
- **Meta Tags**: Generated meta descriptions and titles
- **Heading Structure**: Proper H1-H6 tag hierarchy
- **Internal Linking**: Suggestions for internal link opportunities
- **Readability Analysis**: Content readability scoring
- **XML Sitemap**: Automatically generated sitemap
- **Robots.txt**: SEO-optimized robots configuration

### Audio Narration Features
- **Natural Voice**: High-quality WaveNet voices from Google Cloud
- **Multi-Language Support**: Generate audio in multiple languages
- **Audio Player**: Full-featured HTML5 audio player with:
  - Play/pause controls
  - Volume adjustment with mute
  - Playback speed control (0.5x - 2x)
  - Progress bar with seek functionality
  - Time display (current/total duration)
- **On-Demand Generation**: Audio generated only when requested
- **CDN Delivery**: Fast audio delivery via AWS S3 and CloudFront
- **Status Tracking**: Real-time status updates during generation

### Publishing Features
- **WordPress Integration**:
  - Direct publishing to WordPress sites
  - Supports custom WordPress installations
  - Automatic image upload and formatting
  - Category and tag mapping
  - Custom post status (draft/published)
  
- **Medium Integration**:
  - One-click publish to Medium
  - Automatic content formatting
  - Tag and category support
  - Author attribution maintained

## 📁 Project Structure

```
autoblog/
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   │   ├── config.ts             # Main configuration
│   │   └── roles.ts              # Role-based access control
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication & authorization
│   │   ├── blog/                 # Blog management & CRUD
│   │   ├── comment/              # Comment system with nested replies
│   │   ├── contact/              # Contact form and message management
│   │   ├── user/                 # User management
│   │   ├── oauthConnection/      # OAuth connection management
│   │   ├── postGen/              # AI post generation (LangChain)
│   │   ├── imageGen/             # AI image generation (DALL-E)
│   │   ├── tts/                  # Text-to-speech audio narration
│   │   ├── wordpress/            # WordPress publishing integration
│   │   ├── medium/               # Medium publishing integration
│   │   ├── aws/                  # AWS S3 integration
│   │   ├── email/                # Email service
│   │   ├── swagger/              # API documentation
│   │   └── ...                   # Other modules
│   └── routes/                   # API routes
│       └── v1/                   # API v1 routes
│           ├── auth.route.ts     # Authentication endpoints
│           ├── blog.route.ts     # Blog endpoints
│           ├── comment.route.ts  # Comment endpoints
│           ├── contact.route.ts  # Contact form endpoints
│           ├── user.route.ts     # User endpoints
│           └── appSettings.route.ts  # App settings endpoints
├── front/                        # Frontend React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── elements/         # Reusable UI elements
│   │   │   │   ├── CommentSection.tsx    # Comment system with threading
│   │   │   │   ├── BlogLikeDislike.tsx   # Like/dislike buttons
│   │   │   │   └── AudioPlayer.tsx       # Audio narration player
│   │   │   └── pages/            # Page components
│   │   │       └── Blog.tsx      # Blog post page with audio
│   │   ├── services/             # API services
│   │   │   ├── commentApi.ts     # Comment API integration
│   │   │   └── blogApi.ts        # Blog API integration
│   │   ├── reducers/             # Redux reducers
│   │   │   ├── comment.ts        # Comment state management
│   │   │   └── blog.ts           # Blog state management
│   │   └── utils/                # Utility functions
│   └── public/                   # Static assets
├── docs/                         # Documentation
├── docker-compose*.yml           # Docker configurations
└── package.json                  # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `pnpm commit`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Neelutpal Saha**
- GitHub: [@voidchef](https://github.com/voidchef)
- Email: neelutpalsaha44@gmail.com

## 🙏 Acknowledgments

- OpenAI for providing the GPT and DALL-E APIs
- LangChain for the excellent LLM integration framework
- Material-UI for the beautiful React components
- The open-source community for the amazing tools and libraries

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Password Hashing**: Bcrypt for secure password storage
- **Email Verification**: Optional email verification for new users
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive input validation using Joi
- **XSS Protection**: Protection against cross-site scripting attacks

## �📞 Support

If you have any questions or need help, please:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/voidchef/autoblog/issues)
3. Create a [new issue](https://github.com/voidchef/autoblog/issues/new)

---

<div align="center">
  <p>Made with ❤️ by the Autoblog team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
