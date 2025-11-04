# Quick Start Guide

## Overview
This is a **Next.js monorepo** application where frontend and API routes run on a single server.

## Setup (One Time)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL (Docker or local)

### 2. Start PostgreSQL
```bash
docker run --name tawuniya-postgres \
  -e POSTGRES_DB=tawuniya_wallet \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:14
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
# Create .env file in the root directory
touch .env

# Add the following required variables to .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tawuniya_wallet
# JWT_SECRET=your-secret-key-at-least-32-characters-long
# NODE_ENV=development
```

### 5. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Running the Application

### Single Command
```bash
npm run dev
```

✅ Application runs on: **http://localhost:3000**

- **Frontend Pages**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*
- **API Docs**: http://localhost:3000/api-docs

---

## Access Points

- **Application**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api/docs
- **Prisma Studio**: `npm run prisma:studio`

---

## Test Credentials

```
Customer: john.doe@example.com / password123
Admin: admin@tawuniya.com / password123
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps

# Start if stopped
docker start tawuniya-postgres
```

---

**That's it! One command, one server.** 🚀

