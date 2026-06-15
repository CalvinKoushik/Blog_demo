# StudentHub 🎓

StudentHub is a modern, full-stack community platform designed specifically for students to share projects, write blogs, connect with peers, and build their professional portfolio. 

![StudentHub Architecture](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)

## 🌟 Product Vision
The goal of StudentHub is to bridge the gap between academic learning and professional networking. It provides a dedicated space for students to document their journey, ask questions, and showcase their skills to recruiters.

## 🛠 Tech Stack & Architecture

This project is structured as a **Turborepo** monorepo, splitting concerns into dedicated applications and packages.

### Frontend (`apps/web`)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Base UI](https://base-ui.com/)
- **State Management**: Zustand & React Query
- **Testing**: Jest, React Testing Library, and Playwright (E2E)

### Backend (`apps/api`)
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database Engine**: PostgreSQL (Hosted on [Supabase](https://supabase.com/))
- **Authentication**: JWT & Bcrypt
- **Testing**: Jest (Unit & E2E)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+
- `pnpm` (Corepack enabled)
- A PostgreSQL Database (Supabase recommended)
- A Cloudinary Account (For image uploads)

### 1. Clone & Install
```bash
git clone https://github.com/calvinkoushik/studenthub.git
cd studenthub
corepack enable pnpm
pnpm install
```

### 2. Environment Variables
Copy the provided `.env.example` to both the frontend and backend directories:
```bash
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
```
*Fill in the database URLs, JWT secrets, and Cloudinary keys in `apps/api/.env`.*

### 3. Database Setup (Prisma)
Initialize your database schema and run the seed script to populate realistic starter content:
```bash
# Push schema to database
pnpm --filter api exec prisma db push

# Generate Prisma Client
pnpm --filter api exec prisma generate

# Seed the database with sample users and posts
pnpm --filter api run db:seed
```

### 4. Run Development Servers
Start both the Next.js frontend and NestJS backend concurrently:
```bash
pnpm dev
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/api

---

## 🧪 Testing

This monorepo utilizes a comprehensive testing strategy.

```bash
# Run all unit tests across the monorepo
pnpm test

# Run Playwright End-to-End tests (Frontend)
pnpm --filter web run test:e2e
```

---

## 📦 Deployment Instructions

StudentHub is Dockerized and CI/CD ready via GitHub Actions.

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Vercel automatically detects the Turborepo setup. The `vercel.json` will route the build to `apps/web`.
3. Set `NEXT_PUBLIC_API_URL` to your production backend URL.

### Backend (Render / Railway / AWS)
1. The backend includes an optimized multi-stage `apps/api/Dockerfile`.
2. Connect your hosting provider to the repository.
3. Provide the required Environment Variables.
4. Set the Root Directory to `/` (if using Render, the Dockerfile handles monorepo dependencies).

---

## 👨‍💻 Author

**Calvin Koushik**
- GitHub: [@calvinkoushik](https://github.com/calvinkoushik)
- LinkedIn: [Calvin Koushik](https://www.linkedin.com/in/calvinkoushik)

---
*Built with ❤️ for the student developer community.*
