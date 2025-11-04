# Case Study: Tawuniya Drive -- Building the Digital Wallet Experience

## Background Story

Tawuniya has recently launched a new initiative within the **Drive app**, aiming to enhance customer engagement through a **Digital Wallet**. The wallet allows users to earn points when purchasing insurance products or using services like car wash, towing, and rentals. These points can later be **burned** (used) to get discounts or pay for services.

You've just joined Tawuniya's tech team as a Full Stack Developer. The Product Manager has asked you to build a **prototype** of the Digital Wallet system to demonstrate your understanding of full stack development and how you approach real-world business logic.

## Your Mission

Build a **mini Digital Wallet system** that includes:

## Core Features

### 1. Wallet Balance
- Show current point balance for a user.

### 2. Point Earning
- Users earn points when they use a service (e.g., car wash, insurance).
- Each service has a configurable earning rule (e.g., 10 points per 100 SAR).

### 3. Point Burning
- Users can burn points to pay for services.
- 1 point = 1 SAR (configurable).

### 4. Transaction History
- Show a list of all wallet transactions (earn/burn) with timestamps and service names.

## Technical Requirements

### Backend
- Build RESTful APIs for:
  - `GET /wallet/:userId`
  - `POST /earn`
  - `POST /burn`
  - `GET /transactions/:userId`
- Use JWT for authentication (mocked login is fine).
- Store earning/burning rules in a configuration table.
- Use any backend language (Node.js, Python, Java, etc.).

### Frontend
- Build a simple UI (React, Angular, or Vue) with:
  - Wallet balance display
  - Earn points form (select service, enter amount)
  - Burn points form (enter amount)
  - Transaction history table

### Database
- Design schema for:
  - Users
  - Wallets
  - Transactions
  - Services
  - Configuration rules

## Bonus Challenges
- Add expiry logic for earned points (e.g., expire after 6 months).
- Build a basic admin panel to manage earning/burning rules.
- Visualize KPIs: total earned, total burned, active wallets.

## Deliverables
- Source code (GitHub or zip)
- Postman collection or Swagger for API testing
- Portal to view the demonstration
- Short README explaining setup and architecture