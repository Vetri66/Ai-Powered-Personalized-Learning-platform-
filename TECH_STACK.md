# LearnAI - AI-Powered Adaptive E-Learning Platform
## Tech Stack Overview

---

## Core Framework & Runtime

- **Next.js 16.0.10** - React framework with App Router, SSR, API routes, and Turbopack
- **React 19.2** - Frontend library with latest concurrent features
- **TypeScript 5** - Type-safe JavaScript development across the entire codebase
- **Node.js** - Server-side runtime for API routes and server actions

---

## UI & Styling

- **Tailwind CSS 4.1** - Utility-first CSS framework with custom design tokens
- **Radix UI** - Accessible, unstyled UI primitives (Accordion, Dialog, Dropdown, Tabs, Progress, Select, Tooltip, Sheet, Popover, etc.)
- **Lucide React 0.454** - Consistent SVG icon library
- **tw-animate-css** - Animation utilities for Tailwind
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Intelligent utility class merging
- **next-themes** - Dark/light mode support with system preference detection

---

## AI & Machine Learning

- **Google Generative AI (@google/generative-ai 0.21)** - Gemini AI model integration for intelligent tutoring
- **AI SDK React (3.0.64)** - React hooks for streaming AI interactions
- **@ai-sdk/google** - Google AI provider for the Vercel AI SDK
- **OpenAI (6.37)** - GPT model integration for advanced reasoning
- **RAG Engine (Custom)** - Retrieval Augmented Generation pipeline built in-house
  - Document chunking and indexing
  - Semantic similarity search
  - Confidence scoring per response
  - Source attribution and citation
- **Anti-Cheating Tutor Engine (Custom)** - Socratic method enforcement, direct answer detection
- **Adaptive Learning Orchestrator (Custom)** - Coordinates all AI components for unified responses
- **Student Context Manager (Custom)** - Personalized learning profile tracking
- **Analytics Engine (Custom)** - AI-driven learning gap detection and insights

---

## Database & Backend

- **MongoDB Atlas (Mongoose 8.22)** - Primary NoSQL database for learning data
  - User profiles and roles
  - Course content and embeddings
  - Chat sessions and message history
  - Learning progress and mastery tracking
  - AI interaction logs
- **Supabase** - PostgreSQL database for authentication and relational data
  - Row Level Security (RLS) policies
  - Real-time subscriptions
  - Vector search via pgvector (SQL scripts included)
- **Supabase Auth (@supabase/supabase-js)** - JWT-based authentication
- **Supabase SSR (@supabase/ssr 0.8)** - Server-side rendering support

---

## Form Handling & Validation

- **React Hook Form 7.60** - Performant form state management
- **Zod 3.25** - Schema-first runtime validation
- **@hookform/resolvers** - Zod integration with React Hook Form

---

## Data Visualization & Charts

- **Recharts 2.15** - Responsive charts for learning analytics
  - Learning progress line charts
  - Topic mastery bar charts
  - Weekly study time charts
  - Engagement heatmaps

---

## File Processing

- **pdf-parse 1.1** - PDF text extraction for course material uploads
- **Custom chunking engine** - Semantic text splitting with overlap for RAG pipeline

---

## UI Component Library (Custom Built)

- Accordion, Alert, Alert Dialog, Aspect Ratio
- Avatar, Badge, Breadcrumb, Button, Button Group
- Calendar, Card, Carousel, Chart, Checkbox
- Collapsible, Command (CMDK), Context Menu
- Dialog, Drawer (Vaul), Dropdown Menu
- Empty State, Field, Form, Hover Card
- Input, Input Group, Input OTP
- Label, Menubar, Navigation Menu
- Pagination, Popover, Progress
- Radio Group, Resizable Panels, Scroll Area
- Select, Separator, Sheet, Sidebar
- Skeleton, Slider, Spinner, Switch
- Table, Tabs, Textarea, Toast, Toaster
- Toggle, Toggle Group, Tooltip

---

## Notifications & Feedback

- **Sonner 1.7** - Elegant toast notifications
- **Custom Toast system** - In-app notification management

---

## Utilities

- **date-fns 4.1** - Modern date utility library
- **lodash 4.17** - Utility functions for data manipulation
- **clsx + tailwind-merge** - Conditional class name management
- **react-markdown 10.1** - Markdown rendering for AI responses
- **remark-gfm** - GitHub Flavored Markdown support

---

## Authentication & Security

- **Supabase Auth** - Role-based access control (Student / Educator)
- **JWT Tokens** - Secure session management
- **Row Level Security** - Database-level access policies
- **Middleware (proxy.ts)** - Route protection and session refresh
- **Environment Variables** - Secure API key management via `.env.local`

---

## Development Tools

- **ESLint** - Code linting and quality enforcement
- **PostCSS 8.5** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefix injection
- **Jest 29.7** - Unit and integration testing framework
- **@tailwindcss/postcss** - Tailwind PostCSS plugin
- **@tailwindcss/typography** - Prose styling for markdown content

---

## Project Structure

```
ai-e-learning-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai-tutor/
│   │   │   ├── adaptive/         # Main AI tutor endpoint (RAG + Socratic)
│   │   │   └── quiz/             # Quiz generation endpoint
│   │   ├── chat/
│   │   │   ├── messages/         # Chat message CRUD
│   │   │   └── sessions/         # Chat session management
│   │   ├── courses/
│   │   │   ├── content/          # Course content & RAG pipeline
│   │   │   ├── create/           # Course creation
│   │   │   ├── enroll/           # Student enrollment
│   │   │   └── progress/         # Progress tracking
│   │   ├── instructor/
│   │   │   └── analytics/        # Educator analytics dashboard
│   │   └── upload-context/       # PDF/document upload & processing
│   ├── auth/
│   │   ├── login/                # Sign in page
│   │   ├── sign-up/              # Registration with role selection
│   │   ├── sign-up-success/      # Email verification prompt
│   │   ├── callback/             # OAuth callback handler
│   │   └── error/                # Auth error page
│   ├── student/
│   │   ├── dashboard/            # Student home with progress overview
│   │   ├── ai-tutor/             # AI chat interface with RAG
│   │   ├── courses/              # Course catalog and enrollment
│   │   │   └── [courseId]/       # Individual course view
│   │   ├── chat-history/         # Past AI tutor sessions
│   │   ├── analytics/            # Personal learning analytics
│   │   ├── settings/             # Profile and preferences
│   │   └── layout.tsx            # Student layout with sidebar
│   ├── educator/
│   │   ├── dashboard/            # Educator overview and alerts
│   │   ├── courses/              # Course management
│   │   └── layout.tsx            # Educator layout with sidebar
│   ├── contact/                  # Contact page
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── landing/                  # Landing page sections
│   │   ├── hero.tsx              # Hero with dashboard preview
│   │   ├── features.tsx          # Feature showcase
│   │   ├── stats.tsx             # Platform statistics
│   │   ├── testimonials.tsx      # User testimonials
│   │   ├── pricing.tsx           # Pricing plans
│   │   ├── cta.tsx               # Call to action
│   │   ├── navbar.tsx            # Navigation bar
│   │   └── footer.tsx            # Site footer
│   ├── student/
│   │   ├── sidebar.tsx           # Student navigation sidebar
│   │   └── header.tsx            # Student top header
│   ├── educator/
│   │   ├── sidebar.tsx           # Educator navigation sidebar
│   │   └── header.tsx            # Educator top header
│   ├── ui/                       # 50+ reusable UI components
│   ├── adaptive-ai-tutor.tsx     # Main AI tutor component
│   └── theme-provider.tsx        # Theme context provider
├── lib/
│   ├── ai/
│   │   ├── rag-engine.ts                     # RAG pipeline implementation
│   │   ├── anti-cheating-tutor.ts            # Socratic method enforcement
│   │   ├── adaptive-learning-orchestrator.ts # AI coordination layer
│   │   ├── analytics-engine.ts               # Learning analytics AI
│   │   ├── student-context.ts                # Student profile manager
│   │   └── tutor.ts                          # Core tutor service
│   ├── mongodb/
│   │   ├── connection.ts                     # MongoDB connection pooling
│   │   └── models.ts                         # Mongoose schemas & models
│   ├── supabase/
│   │   ├── client.ts                         # Browser Supabase client
│   │   ├── server.ts                         # Server Supabase client
│   │   └── middleware.ts                     # Session middleware
│   └── utils.ts                              # Shared utility functions
├── contexts/
│   └── auth-context.tsx                      # Authentication React context
├── hooks/
│   ├── use-mobile.ts                         # Mobile detection hook
│   └── use-toast.ts                          # Toast notification hook
├── scripts/
│   ├── 001_create_schema.sql                 # Initial DB schema
│   ├── 002_add_chat_embeddings.sql           # Embeddings table
│   ├── 002_vector_search.sql                 # pgvector setup
│   ├── 003_fix_threshold.sql                 # Search threshold tuning
│   └── 004_fix_vector_column.sql             # Vector column migration
├── public/                                   # Static assets
├── .env.local                                # Environment variables
├── middleware.ts                             # Next.js route middleware
├── next.config.mjs                           # Next.js configuration
├── tailwind.config                           # Tailwind configuration
└── tsconfig.json                             # TypeScript configuration
```

---

## Key Features Implemented

### AI-Powered Features
- **Course-Specific RAG Engine** — Retrieves relevant course content before generating responses
- **Socratic AI Tutor** — Guides students with questions instead of direct answers
- **Anti-Cheating Detection** — Identifies homework/exam completion attempts and redirects
- **Adaptive Difficulty** — Adjusts explanation complexity based on student performance
- **Confidence Scoring** — Every AI response includes a confidence percentage
- **Source Attribution** — Shows which course materials influenced each response
- **Learning Gap Detection** — Automatically identifies weak topics per student
- **Follow-up Question Generation** — Suggests next questions to deepen understanding

### Student Features
- Role-based authentication (Student / Educator)
- Personalized dashboard with progress overview
- AI tutor chat with conversation memory
- Course enrollment and content browsing
- Chat history with session replay
- Learning analytics with charts
- Profile and preference settings

### Educator Features
- Course creation and content management
- PDF/document upload with automatic RAG indexing
- Student engagement analytics
- Most-asked questions heatmap
- AI answer accuracy feedback
- Content improvement suggestions
- Instructor alerts for at-risk students

### Quality & Ethics Layer
- AI answer source citation
- "I don't know" handling when confidence is low
- Human escalation flag for repeated cheating attempts
- Privacy-first data handling
- Role-based access control

---

## Database Models (MongoDB)

| Model | Purpose |
|---|---|
| `User` | Student and educator profiles with Supabase ID link |
| `Course` | Course content, embeddings, and metadata |
| `ChatSession` | Conversation history with message threading |
| `LearningProgress` | Topic mastery scores and weak area tracking |
| `AIInteraction` | Detailed interaction logs for analytics |

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai-tutor/adaptive` | POST | Main RAG-powered AI tutor response |
| `/api/ai-tutor/quiz` | POST | Generate quiz questions from course content |
| `/api/courses/content` | GET/POST | Course content and RAG pipeline |
| `/api/courses/create` | POST | Create new course |
| `/api/courses/enroll` | POST | Student course enrollment |
| `/api/courses/progress` | GET/POST | Track learning progress |
| `/api/chat/sessions` | GET/POST | Chat session management |
| `/api/chat/messages` | GET/POST | Message CRUD operations |
| `/api/instructor/analytics` | GET | Educator dashboard analytics |
| `/api/upload-context` | POST | Upload and process course documents |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# MongoDB
MONGODB_URI=

# AI APIs
GEMINI_API_KEY=
GROK_API_KEY=

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## Deployment & Hosting

- **Vercel** — Optimized Next.js deployment with edge functions
- **MongoDB Atlas** — Cloud-hosted MongoDB with global clusters
- **Supabase Cloud** — Managed PostgreSQL with real-time and auth
- **Environment Variables** — Secure secrets management via Vercel dashboard

---

## Performance Optimizations

- Next.js Turbopack for fast development builds
- Image optimization via `next/image`
- MongoDB connection pooling with cached connections
- Lazy loading for heavy components
- Code splitting via Next.js App Router
- Static generation for landing pages
- Server components to reduce client bundle size

---

## Development Workflow

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint code quality check
npm run test         # Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Test coverage report
```

---

## Security

- Supabase Row Level Security (RLS) on all tables
- JWT-based session management with auto-refresh
- Server-side session validation via middleware
- API routes protected with auth checks
- Environment variables never exposed to client
- MongoDB connection string secured in server-only context

---

*This platform represents a production-grade, industry-standard AI-powered adaptive learning system combining cutting-edge AI with pedagogical best practices to deliver personalized education at scale.*
