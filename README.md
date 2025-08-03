# Canva AI - AI-Powered Design Assistant

A sophisticated Canva app that leverages AI to help users create stunning designs with intelligent suggestions and automated design generation. This app combines the power of Google's Gemini AI with Canva's design platform to provide an enhanced creative experience.

## 🚀 Features

### AI-Powered Design Generation
- **Smart Design Suggestions**: Generate design concepts based on natural language prompts
- **Gemini AI Integration**: Powered by Google's Gemini 2.5 Flash model for intelligent design recommendations
- **Color Palette Generation**: AI-suggested color schemes for your designs
- **Layout Recommendations**: Smart layout suggestions based on your content

### Digital Asset Management (DAM)
- **Image Library**: Browse and manage your design assets
- **Folder Organization**: Organize assets in containers/folders
- **Search & Filter**: Find assets quickly with advanced search capabilities
- **Thumbnail Previews**: Visual preview of all your assets

### Design Automation
- **One-Click Design Application**: Apply AI-generated designs directly to your Canva canvas
- **Element Placement**: Automatic placement of text, shapes, and other design elements
- **Style Consistency**: Maintain consistent design language across your projects

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Canva App Components
- **Backend**: Node.js, Express.js
- **AI Integration**: Google Gemini API
- **Styling**: Canva App UI Kit, CSS Modules
- **Build Tools**: Webpack, TypeScript
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

- Node.js `v18` or `v20.10.0`
- npm `v9` or `v10`
- Canva Developer Account
- Google Gemini API Key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd canva-ai
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Canva App Configuration
CANVA_APP_ID=your_canva_app_id
CANVA_APP_ORIGIN=your_app_origin
CANVA_BACKEND_PORT=3001
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_HOST=http://localhost:3001
CANVA_HMR_ENABLED=false

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Get Your Canva App ID

1. Go to the [Canva Developer Portal](https://www.canva.com/developers/apps)
2. Create a new app or select an existing one
3. Copy the App ID from the app details
4. Add it to your `.env` file

### 4. Get Your Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Start Development Server

```bash
npm start
```

The development server will be available at:
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

## 🎨 Using the App

### Preview in Canva

1. Go to the [Canva Developer Portal](https://www.canva.com/developers/apps)
2. Select your app
3. Set **App source > Development URL** to `http://localhost:8080`
4. Click **Preview** to open in Canva editor

### AI Design Generation

1. **Enter a Prompt**: Describe the design you want to create
2. **Generate Suggestions**: Click "Generate Design" to get AI-powered suggestions
3. **Review Options**: Browse through multiple design concepts
4. **Apply Design**: Click on a suggestion to apply it to your canvas

### Asset Management

1. **Browse Assets**: Use the asset browser to find images and folders
2. **Search**: Use the search functionality to find specific assets
3. **Organize**: Create folders to organize your assets
4. **Add to Design**: Click on assets to add them to your canvas

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check TypeScript types
npm run lint:types
```

### Project Structure

```
canva-ai/
├── src/                    # Frontend source code
│   ├── app.tsx            # Main app component
│   ├── config.ts          # App configuration
│   └── adapter.ts         # Data adapter
├── backend/               # Backend server
│   ├── server.ts          # Express server setup
│   └── routers/           # API routes
├── utils/                 # Utility functions
├── scripts/               # Build and deployment scripts
└── tests/                 # Test files
```

### Adding New Features

1. **Frontend Components**: Add new React components in `src/`
2. **API Endpoints**: Add new routes in `backend/routers/`
3. **AI Integration**: Extend the Gemini API integration in `src/app.tsx`
4. **Styling**: Use CSS Modules for component-specific styles

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.ts
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Update your `.env` file with production values:

```bash
CANVA_BACKEND_HOST=https://your-production-backend.com
GEMINI_API_KEY=your_production_gemini_key
```

## 🔒 Security

- **API Key Management**: Never commit API keys to version control
- **CORS Configuration**: Configure CORS properly for production
- **Request Validation**: Validate all incoming requests
- **HTTPS**: Use HTTPS in production environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the terms specified in the LICENSE.md file.

## 🆘 Support

- **Documentation**: [Canva Apps Documentation](https://www.canva.dev/docs/apps/)
- **Developer Portal**: [Canva Developer Portal](https://www.canva.com/developers/apps)
- **Issues**: Create an issue in this repository

## 🔄 Updates

Stay updated with the latest Canva Apps SDK and dependencies:

```bash
npm update
```

---

**Note**: This app requires a Canva Developer account and Google Gemini API access. Make sure you have the necessary permissions and API keys before running the application.
