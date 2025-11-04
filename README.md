# Tawuniya Digital Wallet - Full Stack Application

## Project Structure

This is a **Next.js monorepo** application with integrated API routes:

```
tw-digital-wallet/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/        # API routes (Next.js API handlers)
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # User dashboard
│   │   └── ...
│   │
│   ├── core/            # Business logic layer
│   │   ├── services/   # Service layer
│   │   ├── repositories/ # Data access layer
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/ # Auth, validation, error handling
│   │   └── ...
│   │
│   ├── components/      # React components
│   ├── lib/            # Utilities and API client
│   └── hooks/          # React hooks
│
└── README.md           # This file
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### 3. Start Development Server
```bash
npm run dev
```

✅ Application runs on: **http://localhost:3000**

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker)
- npm or yarn

## Setup

### 1. Start PostgreSQL
```bash
# Using Docker
docker run --name tawuniya-postgres \
  -e POSTGRES_DB=tawuniya_wallet \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:14

# Or use local PostgreSQL
psql postgres
CREATE DATABASE tawuniya_wallet;
\q
```

### 2. Configure Environment
```bash
# Create .env file in the root directory
touch .env

# Add the following required variables to .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tawuniya_wallet
# JWT_SECRET=your-secret-key-at-least-32-characters-long
# NODE_ENV=development
# 
# Optional variables (with defaults):
# PORT=3000
# JWT_EXPIRES_IN=7d
# ALLOWED_ORIGINS=http://localhost:3000
# POINT_TO_SAR_RATE=1
# DEFAULT_EXPIRY_DAYS=180
```

### 3. Initialize Database
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The application will start on **http://localhost:3000**

## Access

- **Application**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api/docs
- **Prisma Studio**: `npm run prisma:studio`

## Test Credentials

```
Customer: john.doe@example.com / password123
Admin: admin@tawuniya.com / password123
```

## Documentation

- **API Documentation**: Available at `/api-docs` (Swagger UI)
- **Project Documentation**: `tw-digital-wallet-doc.md`

## Tech Stack

**Full Stack:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Validation**: Zod
- **Dependency Injection**: Inversify
- **Logging**: Winston

## License

MIT
