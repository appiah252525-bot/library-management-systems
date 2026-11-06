# 🎓 Apex University Library Management System

A complete, production-ready, full-stack **University Library Management System** built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL with Prisma ORM**, **Clerk Authentication**, and optimized for one-click deployment on **Vercel**.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- Seamless authentication powered by **Clerk**: user sign-up, login, password recovery, session handling.
- Three defined institutional roles:
  1. **Administrator**: Full system authority (manage books, students, catalog deletion, issue/return books, settle fines, system configuration).
  2. **Librarian**: Operational authority (catalog management, add/edit books & students, issue books, process returns, waive/settle fines).
  3. **Student**: Patron privileges (browse catalog, search books, view borrowing records, inspect fine status, receive due date alerts).

### 2. 📊 Real-Time Analytics Dashboard
- KPI summary metric cards: **Total Unique Titles**, **Total Physical Copies**, **Currently Borrowed Books**, **Overdue Delinquencies**, **Registered Student Patrons**, and **Total Outstanding Unpaid Fines**.
- Interactive **Area Chart** showing 6-month monthly borrow and return circulation velocity (powered by Recharts).
- Dynamic **Bar Chart** visualizing catalog inventory distribution by academic department.
- Real-time **Recent Circulation Activity Ledger** with instant action shortcuts.

### 3. 📚 Comprehensive Book Catalog Management
- Full CRUD operations: Create, Read, Update, and Delete books.
- Fields: Title, Author(s), ISBN (10/13 format), Category, Publisher, Publication Year, Total Physical Copies in Stock, Direct Cover Image URL, Synopsis/Abstract.
- Automatic **Available Inventory Calculation**: Computes in real-time `availableQuantity = totalQuantity - activeBorrowedCopies`.
- Deletion safety guard: Prevents deletion of any book title while copies remain actively checked out by students.

### 4. 👨‍🎓 Student Patron Management
- Student registration, profile updates, and matriculation tracking.
- Fields: Unique Student Number (e.g. `STU-2024-001`), Full Name, Academic Department, University Email, Phone.
- Dedicated Student Profile page with:
  - Active book checkouts count.
  - Lifetime circulation history.
  - Outstanding overdue balance.
  - Direct actions to mark books as returned or settle penalty fees.

### 5. 🔄 Circulation & Loan Tracking (Borrow & Return)
- **Check-Out (Issue Book)**:
  - Instant issuance modal with student & book selection.
  - Configurable due date (defaults to 14 days).
  - Validation rules: Prevents borrowing when book has 0 stock or when student holds delinquent overdue books.
- **Check-In (Process Return)**:
  - One-click return processing.
  - Dynamic overdue calculation: Automatically compares return date against due date.
  - Fine generation: Accrues daily overdue rate (e.g., \$1.00/day) for late returns.

### 6. 💵 Fine & Penalty Management
- Real-time calculation of accumulated overdue fines.
- Dedicated fines portal filtering by **Unpaid / Pending**, **Settled / Paid**, or **All**.
- Fine payment settlement modal: Records payment method (Cash at Front Desk, Credit Card, Student Account Balance, Digital Payment) and timestamps receipt.
- Financial accounting summary: Total fines assessed, total deposited, and pending receivables.

### 7. 🔍 Multi-Criteria Advanced Search & Discovery
- Search simultaneously or individually by:
  - Book Title keywords
  - Author Name
  - ISBN code
  - Academic Category dropdown
- Real-time results showing live shelf stock, publication details, and instant "Issue" actions.

### 8. 📈 Comprehensive Institutional Reports
- **Most Borrowed Books**: Top titles ranked by campus checkout volume.
- **Top Active Students**: Patrons with the highest engagement.
- **Delinquent & Overdue Audit**: Table of late loans with exact days overdue and accrued penalty totals.
- **Inventory Utilization**: Ratio of active loans to total shelf volume.
- **Print & Export Ready**: Optimized `@media print` stylesheets for one-click PDF generation.

### 9. 🔔 Automated Notification & Overdue Reminder System
- Proactive due date warnings (items due within 72 hours).
- Delinquency alerts with severity indicators.
- **"Dispatch All Reminders"** button: Triggers automated student reminder notifications.

### 10. 🎨 UI/UX Excellence & Dark Mode
- Built with Tailwind CSS and Next-Themes.
- Seamless Dark / Light mode toggling with persisted preference.
- Rich toast notifications with Sonner.
- Clean responsive layout for mobile, tablet, and desktop.

---

## 🗂️ Complete Project Folder Structure

```
university-library-system/
├── prisma/
│   ├── schema.prisma         # PostgreSQL Prisma data models & enums
│   └── seed.ts               # Comprehensive seed script (mock users, books, students, loans, fines)
├── public/                   # Static assets & icons
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx # Clerk Sign-In Page
│   │   │   └── sign-up/[[...sign-up]]/page.tsx # Clerk Sign-Up Page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                      # Dashboard shell (Sidebar + Navbar + Auth state)
│   │   │   ├── page.tsx                        # Main Dashboard (KPI cards, charts, recent loans)
│   │   │   ├── books/
│   │   │   │   ├── page.tsx                    # Book Catalog (Grid, filters, search, pagination)
│   │   │   │   ├── new/page.tsx                # Register New Book form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx                # Book Details & Borrowing History
│   │   │   │       └── edit/page.tsx           # Edit Book Form
│   │   │   ├── students/
│   │   │   │   ├── page.tsx                    # Student Directory & Department Filter
│   │   │   │   ├── new/page.tsx                # Register Student Patron
│   │   │   │   └── [id]/page.tsx               # Student Profile, Active Loans & Fine History
│   │   │   ├── borrowings/
│   │   │   │   └── page.tsx                    # Circulation Ledger (All, Active, Overdue, Returned)
│   │   │   ├── fines/
│   │   │   │   └── page.tsx                    # Fine Management & Payment Settlement Portal
│   │   │   ├── search/
│   │   │   │   └── page.tsx                    # Advanced Catalog Search Engine
│   │   │   ├── reports/
│   │   │   │   └── page.tsx                    # Analytics, Most Borrowed, Overdue Audit, Financials
│   │   │   └── notifications/
│   │   │       └── page.tsx                    # Overdue Reminders & Notice Dispatch Center
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── sync-user/route.ts          # Sync Clerk User with DB & return Role
│   │   │   ├── dashboard/
│   │   │   │   └── stats/route.ts              # Dashboard KPIs, trends, auto-overdue sync
│   │   │   ├── books/
│   │   │   │   ├── route.ts                    # GET books (search/filter), POST create book
│   │   │   │   └── [id]/route.ts               # GET book, PUT update book, DELETE book
│   │   │   ├── students/
│   │   │   │   ├── route.ts                    # GET students, POST create student
│   │   │   │   └── [id]/route.ts               # GET student, PUT update student, DELETE student
│   │   │   ├── borrowings/
│   │   │   │   ├── route.ts                    # GET borrow records, POST issue book
│   │   │   │   └── return/route.ts             # POST return book & calculate late fine
│   │   │   ├── fines/
│   │   │   │   ├── route.ts                    # GET fines & totals
│   │   │   │   └── [id]/pay/route.ts           # PATCH settle fine
│   │   │   ├── reports/
│   │   │   │   └── route.ts                    # Aggregated institutional analytics
│   │   │   └── notifications/
│   │   │       ├── route.ts                    # Overdue & due-soon notification query
│   │   │       └── send-reminders/route.ts     # Dispatch notices endpoint
│   │   ├── globals.css                         # Tailwind CSS base styles & dark theme variables
│   │   ├── layout.tsx                          # Root layout with ClerkProvider & ThemeProvider
│   │   └── not-found.tsx                       # Custom 404 page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                     # Responsive navigation with role badge
│   │   │   ├── Navbar.tsx                      # Topbar with global search & Clerk UserButton
│   │   │   └── ThemeToggle.tsx                 # Sun/Moon theme switcher
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx                    # KPI statistic card component
│   │   │   ├── OverviewChart.tsx               # Recharts monthly trends & category charts
│   │   │   └── RecentBorrowingsTable.tsx       # Recent activity data table
│   │   ├── books/
│   │   │   ├── BookCard.tsx                    # Book card with stock status & cover art
│   │   │   ├── BookForm.tsx                    # Zod validated book form with image preview
│   │   │   └── BookSearchFilter.tsx            # Live filter and category dropdown
│   │   ├── students/
│   │   │   └── StudentForm.tsx                 # Student registration form
│   │   ├── borrowings/
│   │   │   └── BorrowBookModal.tsx             # Issue book modal dialog
│   │   ├── ui/
│   │   │   ├── Button.tsx                      # Variant buttons with loading spinners
│   │   │   ├── Input.tsx                       # Form inputs with label & error states
│   │   │   ├── Select.tsx                      # Custom select component
│   │   │   ├── Badge.tsx                       # Status pill badges
│   │   │   ├── Modal.tsx                       # Accessible dialog modal
│   │   │   └── Pagination.tsx                  # Numbered pagination component
│   │   └── providers/
│   │       ├── ThemeProvider.tsx               # Next-Themes provider
│   │       └── ToastProvider.tsx               # Sonner toast provider
│   ├── lib/
│   │   ├── prisma.ts                           # Global singleton PrismaClient
│   │   ├── auth.ts                             # Clerk session & role authorization helper
│   │   ├── utils.ts                            # Date-fns, currency formatters, clsx/twMerge
│   │   └── validations.ts                      # Zod schemas for all models & mutations
│   ├── types/
│   │   └── index.ts                            # TypeScript domain models & DTO definitions
│   └── middleware.ts                           # Clerk authentication route protection
├── .env.example                                # Environment variable documentation
├── .gitignore                                  # Git exclusion rules
├── next.config.ts                              # Next.js 15 configuration
├── package.json                                # Project dependencies & npm scripts
├── postcss.config.mjs                          # PostCSS setup for Tailwind CSS
├── tailwind.config.ts                          # Tailwind typography, theme & colors
├── tsconfig.json                               # Strict TypeScript configuration
└── vercel.json                                 # Vercel deployment build settings
```

---

## 🗄️ Database Architecture & Prisma Schema

The PostgreSQL database uses relational integrity, indexes for high-throughput queries, and strict typing.

### Entity Relationship Model

```mermaid
erDiagram
    User ||--o| Student : "links to"
    Student ||--o{ BorrowRecord : "borrows"
    Book ||--o{ BorrowRecord : "issued in"
    BorrowRecord ||--o| Fine : "incurs"

    User {
        string id PK
        string clerkId UK
        string name
        string email UK
        enum role "ADMIN, LIBRARIAN, STUDENT"
        datetime createdAt
    }

    Student {
        string id PK
        string studentNumber UK
        string fullName
        string department
        string email UK
        string phone
        string userId FK
        datetime createdAt
    }

    Book {
        string id PK
        string title
        string author
        string isbn UK
        string category
        string publisher
        int publicationYear
        int quantity
        string coverImage
        string description
        datetime createdAt
    }

    BorrowRecord {
        string id PK
        string studentId FK
        string bookId FK
        datetime borrowDate
        datetime dueDate
        datetime returnDate
        enum status "BORROWED, RETURNED, OVERDUE"
        string notes
        datetime createdAt
    }

    Fine {
        string id PK
        string borrowRecordId FK
        float amount
        enum paidStatus "UNPAID, PAID"
        datetime paidAt
        string paymentMethod
        datetime createdAt
    }
```

---

## 🚀 Step-by-Step Installation & Local Setup

### 1. Prerequisites
- **Node.js** >= 18.18.0 (Node 20 or 22 LTS recommended)
- **PostgreSQL** database (Local instance, or free cloud provider like [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com))
- A free [Clerk](https://clerk.com) account

### 2. Clone or Enter Project Directory
```bash
cd university-library-system
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your PostgreSQL connection string and Clerk credentials:
```env
DATABASE_URL="postgresql://username:password@ep-cool-db.us-east-2.aws.neon.tech/library_db?sslmode=require"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FINE_PER_DAY=1.00
DEFAULT_LOAN_DAYS=14
```

### 5. Initialize Database & Push Schema
```bash
# Push schema to your PostgreSQL database
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

### 6. Seed the Database with Realistic Testing Data
Run the comprehensive seed script to populate realistic books, students across departments, active borrows, overdue loans, and fines:
```bash
npx prisma db seed
```

### 7. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Clerk Authentication Setup Guide

1. **Create Clerk Application**:
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a new application named **"Apex University Library"**.
   - Choose **Email** and **Google** (or other authentication providers).
2. **Copy API Keys**:
   - Navigate to **API Keys** in the Clerk dashboard.
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into your `.env` file.
3. **Configure Path URLs**:
   - In Clerk Dashboard under **Paths**:
     - Sign-in path: `/sign-in`
     - Sign-up path: `/sign-up`
     - After sign-in: `/`
     - After sign-up: `/`
4. **Assigning User Roles (Admin / Librarian / Student)**:
   - In Clerk Dashboard, go to **Users**, select a user, and scroll down to **Metadata -> Public Metadata**.
   - To grant Administrator rights, enter:
     ```json
     {
       "role": "ADMIN"
     }
     ```
   - For Librarian rights:
     ```json
     {
       "role": "LIBRARIAN"
     }
     ```
   - For Student rights (default):
     ```json
     {
       "role": "STUDENT"
     }
     ```
   - The application automatically synchronizes this role into the PostgreSQL `User` table upon their first sign-in!

---

## 🐙 GitHub Setup Instructions

Follow these commands to push the project to your GitHub repository:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit files
git commit -m "feat: complete production-ready University Library Management System"

# 4. Set main branch
git branch -M main

# 5. Add your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/your-username/university-library-system.git

# 6. Push to GitHub
git push -u origin main
```

---

## ☁️ Vercel Deployment Instructions

Deploying this application to Vercel takes under 2 minutes:

### 1. Push code to GitHub
Make sure your latest code is pushed to your GitHub repository as detailed above.

### 2. Import Project into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your `university-library-system` GitHub repository.
3. Keep the framework preset as **Next.js**.

### 3. Add Environment Variables in Vercel
In the **Environment Variables** section, add the following:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | Your production PostgreSQL connection string (Neon / Supabase / AWS RDS) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production publishable key (`pk_live_...` or `pk_test_...`) |
| `CLERK_SECRET_KEY` | Clerk production secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` |
| `NEXT_PUBLIC_APP_URL` | Your production domain (e.g. `https://your-library.vercel.app`) |
| `NEXT_PUBLIC_FINE_PER_DAY` | `1.00` |
| `DEFAULT_LOAN_DAYS` | `14` |

### 4. Build Command
The repository includes a custom `vercel.json` and package script that automatically executes:
```bash
prisma generate && next build
```
Click **Deploy**. Your University Library Management System will be live and production-ready!

---

## 🏗️ Project Architecture & Design Decisions

1. **Next.js 15 App Router & React 19**:
   - Uses React Server Components (RSC) principles and client boundaries (`"use client"`) strategically for interactive forms and charts.
   - High-performance Route Handlers (`app/api/**/route.ts`) for clean RESTful JSON endpoints.
2. **Prisma ORM & Connection Reliability**:
   - Singleton pattern (`src/lib/prisma.ts`) prevents exhaustion of connection pools during hot module replacement.
   - Comprehensive cascade configurations ensure relational integrity when books or students are referenced in circulation logs.
3. **Zod Validation Everywhere**:
   - Client and server share unified schemas in `src/lib/validations.ts`.
   - Incoming payloads to API routes are sanitized and validated with type-safe field error returns.
4. **Dynamic Overdue & Fine Calculation Engine**:
   - Overdue records and fine amounts are computed dynamically on each dashboard load and loan query.
   - No stale statuses: if the due date passes, the system automatically transitions the record to `OVERDUE` and computes the exact fine based on the days elapsed.
5. **Fail-Safe Fallback for Development**:
   - `src/lib/auth.ts` and `src/middleware.ts` contain built-in graceful fallbacks if Clerk keys are initially unpopulated during testing, allowing local inspection without friction.
