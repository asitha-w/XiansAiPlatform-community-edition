# AI Studio - React Web Application

A React-based web application that enables users to discover and engage with AI agents within the organization. Built with Scandinavian design principles emphasizing simplicity, functionality, and clean aesthetics.

## 🏗️ Architecture

The application follows a three-panel layout:

1. **Agent Chat Panel** (Left) - Interactive chat interface with AI agents
2. **Business Entity Panel** (Center) - Display and edit business entities (orders, customers, invoices)
3. **Recommendations Panel** (Right) - AI-powered insights, validations, and suggestions

## 🎨 Design Philosophy

- **Scandinavian Simplicity**: Clean, minimal interface with focus on functionality
- **Nordic Color Palette**: Muted blues, grays, and whites inspired by Nordic nature
- **Typography**: Inter font family for excellent readability
- **Spacing**: Consistent 8px grid system for visual harmony

## 🛠️ Tech Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Material-UI v5** for consistent design system
- **React Router v6** for navigation
- **TanStack Query** for server state management
- **Axios** for HTTP client
- **React Hook Form + Zod** for forms and validation

## 📱 Features

### Chat Interface
- Agent selection dropdown
- Real-time message display
- File and action message support
- Message timestamps
- Typing indicators

### Business Entity Management
- Dynamic entity display (orders, customers, invoices)
- Inline editing capabilities
- Status tracking with color-coded chips
- Detailed entity information panels

### AI Recommendations
- Priority-based recommendation grouping
- Different recommendation types (validation, warning, suggestion, info)
- Actionable insights with apply/dismiss options
- Real-time recommendation updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd samples/web-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Simple component combinations
│   └── organisms/       # Complex component groups
├── layouts/             # Page layout components
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── context/             # React context providers
├── types/               # TypeScript type definitions
├── utils/               # Helper functions and theme
└── App.tsx              # Main application component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OIDC_AUTHORITY=https://your-auth-provider.com
VITE_OIDC_CLIENT_ID=your-client-id
```

### Theme Customization

The Scandinavian theme can be customized in `src/utils/theme.ts`:

- Color palette
- Typography settings
- Component overrides
- Spacing and borders

## 🧪 Testing

The application uses Vitest and React Testing Library:

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## 🔐 Authentication

The application supports generic OpenID Connect authentication:

- Keycloak
- Auth0
- Azure AD
- Google Identity
- Custom OIDC providers

Configure your OIDC provider in the environment variables.

## 🎯 Key Components

### MainLayout
The primary layout component that organizes the three-panel structure.

### ChatPanel
Interactive chat interface with agent selection and message history.

### BusinessEntityPanel
Dynamic business entity display with edit capabilities.

### RecommendationsPanel
AI-powered insights and recommendations with priority grouping.

## 📊 Performance

- Code splitting by routes
- Lazy loading for heavy components
- Memoization for expensive computations
- Optimized Material-UI bundle size

## 🤝 Contributing

1. Follow the established component structure
2. Use TypeScript for all new code
3. Follow the Scandinavian design principles
4. Write tests for new components
5. Update documentation as needed

## 📄 License

This project is part of the Flowmaxer.ai Community Edition.

---

Built with ❤️ using React, TypeScript, and Scandinavian design principles.
