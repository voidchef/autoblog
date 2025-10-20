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

### 📊 Analytics & Insights
- **Google Analytics Integration**: Track performance and engagement
- **Content Analytics**: Monitor post performance and reader behavior
- **SEO Metrics**: Track search engine optimization effectiveness

### 🔐 User Management
- **JWT Authentication**: Secure user authentication with JWT tokens
- **Role-Based Access**: Different permission levels for users
- **Profile Management**: User profiles with customizable settings
- **API Key Management**: Secure storage of user API keys

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

## 🛠️ Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **LangChain** - AI/LLM integration
- **OpenAI API** - Content and image generation
- **AWS S3** - File storage
- **PM2** - Process management

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
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=your-s3-bucket
   
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
- **Blog Management**: `/v1/blogs/*`
- **User Management**: `/v1/users/*`
- **App Settings**: `/v1/app-settings/*`

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

## 📁 Project Structure

```
autoblog/
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication
│   │   ├── blog/                 # Blog management
│   │   ├── user/                 # User management
│   │   ├── postGen/              # AI post generation
│   │   ├── imageGen/             # AI image generation
│   │   ├── aws/                  # AWS integration
│   │   └── ...                   # Other modules
│   └── routes/                   # API routes
├── front/                        # Frontend React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── elements/         # Reusable UI elements
│   │   │   │   ├── CommentSection.tsx   # Comment system (NEW)
│   │   │   │   └── BlogLikeDislike.tsx  # Like/dislike buttons (NEW)
│   │   │   └── pages/            # Page components
│   │   ├── services/             # API services
│   │   │   ├── commentApi.ts     # Comment API (NEW)
│   │   │   └── blogApi.ts        # Blog API (updated)
│   │   ├── reducers/             # Redux reducers
│   │   │   └── comment.ts        # Comment state (NEW)
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

## 📞 Support

If you have any questions or need help, please:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/voidchef/autoblog/issues)
3. Create a [new issue](https://github.com/voidchef/autoblog/issues/new)

---

<div align="center">
  <p>Made with ❤️ by the Autoblog team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
