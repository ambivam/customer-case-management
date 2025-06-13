# Customer Case Management System - Installation Guide

This guide will help you set up and run the Customer Case Management application locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- SQLite (included in the project)

## Installation Steps

1. Clone the repository and navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   # Using npm
   npm install --legacy-peer-deps
   # or using yarn
   yarn install --ignore-peer-dependencies
   ```
   
   Note: We use `--legacy-peer-deps` or `--ignore-peer-dependencies` to handle some TypeScript-related dependency conflicts.

3. Set up environment variables:
   Create a `.env` file in the app directory with the following content:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"  # Replace with a secure random string
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. (Optional) Seed the database with an analyst account:
   ```bash
   npm run ts-node scripts/seed-analyst.ts
   # or using yarn
   yarn ts-node scripts/seed-analyst.ts
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or using yarn
   yarn dev
   ```

2. The application will be available at:
   - Main application: [http://localhost:3000](http://localhost:3000)
   - API endpoints: [http://localhost:3000/api/*](http://localhost:3000/api/*)

## Project Structure

- `/app` - Next.js application directory
- `/app/api` - API routes
- `/prisma` - Database schema and migrations
- `/uploads` - File storage for case documents
- `/scripts` - Utility scripts including database seeding

## Features

- User and Analyst authentication
- Case management with different categories (Customer, Merchant, Commercial)
- File upload and document management
- Case status tracking (Open, In Progress, Pending, Resolved, Closed)
- Priority levels (Low, Medium, High, Critical)
- Case updates and communication system

## Database Schema

The application uses SQLite with Prisma ORM and includes the following models:
- User (customers)
- Analyst (support staff)
- Case (support tickets)
  - Status values: OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED
  - Category values: CUSTOMER, MERCHANT, COMMERCIAL
  - Priority values: LOW, MEDIUM, HIGH, CRITICAL
- Document (uploaded files)
- CaseUpdate (communication logs)

Note: Since SQLite doesn't support enums, status, category, and priority are implemented as string fields with specific valid values.

## Troubleshooting

1. Database Issues:
   - If you encounter database errors, try deleting the `dev.db` file and run:
     ```bash
     npx prisma db push
     ```

2. File Upload Issues:
   - Ensure the `/uploads` directory exists and has write permissions
   - Check if the file size is within the allowed limit

3. Build Errors:
   - Clear the `.next` directory and node_modules:
     ```bash
     rm -rf .next node_modules
     npm install
     # or
     yarn install
     ```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npx prisma studio` - Open Prisma database GUI
