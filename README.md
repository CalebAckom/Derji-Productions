# Derji Productions Website

A professional, high-performance web application for Derji Productions, a multi-disciplinary media production house specializing in photography, videography, and sound production.

## Features

- **Professional Portfolio**: Showcase photography, videography, and sound production work
- **Service Catalog**: Detailed service offerings with pricing and descriptions
- **Online Booking**: Client booking system with calendar integration
- **Contact Management**: Inquiry handling and client communication
- **Admin Dashboard**: Content management and booking administration
- **Responsive Design**: Golden circuit-board aesthetic across all devices
- **Performance Optimized**: Fast loading with image optimization and caching

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and builds
- Tailwind CSS with custom golden circuit-board theme
- React Router for navigation
- React Hook Form with Zod validation
- Axios for API communication

### Backend
- Node.js 18+ with TypeScript
- Express.js framework
- PostgreSQL with Prisma ORM
- JWT authentication
- AWS S3 for file storage
- SendGrid for email services
- Sharp for image processing

### Infrastructure
- Docker containers for development
- PostgreSQL database
- Redis for caching
- AWS S3 for media storage
- Vercel/Railway for deployment

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd derji-productions-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```
   
   Edit the `.env` files with your configuration values.

4. **Start with Docker (Recommended)**
   ```bash
   npm run docker:up
   ```

5. **Or start manually**
   ```bash
   # Start PostgreSQL (if not using Docker)
   # Then run:
   npm run dev
   ```

### Database Setup

1. **Generate Prisma client**
   ```bash
   cd backend
   npm run db:generate
   ```

2. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

## Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop all Docker services

**Frontend:**
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run test:frontend` - Run frontend tests

**Backend:**
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests

### Project Structure

```
derji-productions-website/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API client services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models (Prisma)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
├── docker-compose.yml      # Docker services configuration
└── README.md              # This file
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `AWS_S3_BUCKET` - S3 bucket name for media storage
- `SENDGRID_API_KEY` - SendGrid API key for emails

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

## Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your repository to Railway or Render
2. Set environment variables in the platform dashboard
3. Configure PostgreSQL database
4. Deploy automatically on push to main branch

### Database
- Use Railway PostgreSQL or Render PostgreSQL
- Run migrations: `npm run db:migrate`
- Seed data: `npm run db:seed`

## Testing

The project uses a dual testing approach:

- **Unit Tests**: Jest for backend, Vitest for frontend
- **Property-Based Tests**: fast-check for comprehensive input testing
- **Integration Tests**: Supertest for API testing
- **E2E Tests**: Playwright for end-to-end testing

Run tests:
```bash
npm test                    # All tests
npm run test:frontend      # Frontend tests only
npm run test:backend       # Backend tests only
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Derji Productions. All rights reserved.

## Support

For support, email support@derjiproductions.com or create an issue in the repository.