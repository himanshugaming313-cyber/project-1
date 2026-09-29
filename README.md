# ⚡ TeenTrack — Production-Ready Teenager Expense & Budget Tracker

TeenTrack is a full-stack, responsive web application engineered specifically for teenagers, students, and young adults to track daily expenses, control impulse spending, set monthly budgets, and build healthy lifelong financial habits.

Built with **React.js**, **Node.js/Express.js (MVC Architecture)**, and **Supabase PostgreSQL**, the application features JWT + bcrypt authentication, interactive Recharts visualizations, deterministic smart recommendation logic, and an educational Financial Health Score (0–100).

---

## 🌟 Key Features

- **🔐 Secure Authentication:**
  - Strict password hashing with `bcrypt` (12 salt rounds)
  - Stateless JSON Web Tokens (JWT) with bearer authorization headers
  - Centralized authentication middleware verifying ownership on every resource
  - Zero password hash exposure in responses

- **📊 Comprehensive Financial Dashboard:**
  - Real-time calculations: Total Monthly Income, Expenses, Net Remaining, and Savings Rate
  - Safe zero-income handling and division-by-zero protection
  - Immediate budget alert notices for categories exceeding 80% or 100% of limits
  - Top spending category quick cards & recent activity feed

- **💳 Complete Expense Management (CRUD):**
  - Add, edit, delete, and view expenses
  - 12 teen-relevant categories: `Food`, `Transport`, `Education`, `Entertainment`, `Shopping`, `Subscriptions`, `Gaming`, `Health`, `Bills`, `Travel`, `Personal`, `Other`
  - 6 payment channels: `Cash`, `UPI`, `Debit Card`, `Credit Card`, `Bank Transfer`, `Other`
  - **Needs vs. Wants:** Explicit `is_necessary` classification powering saving insights
  - Advanced search by title/note, multi-category filters, payment method filters, and date range filters
  - Server-side sorting and pagination (`?page=1&limit=15`)
  - Confirmation modals preventing accidental expense deletions

- **🎯 Category Budget Tracking:**
  - Monthly spending caps per category
  - Real-time spent vs. limit progress bars
  - Progressive visual states: Normal (green) → Warning (amber, >=80%) → Exceeded (red, >=100%)
  - Multi-month and multi-year tracking

- **📈 Visual Analytics with Recharts:**
  - **Pie Chart:** "Where is my money going?" with percentages and tooltips
  - **Bar Chart:** Monthly category spending comparison
  - **Area/Line Chart:** Expense over time showing daily spending acceleration
  - **6-Month Trend:** Historic Income vs. Expense habit progression
  - **Spending Patterns:** Daily average, weekly average, peak spending day, top category, and Needs vs. Wants ratio

- **💡 Deterministic Smart Recommendation Engine:**
  - Rule-based financial guidance (no black-box AI required):
    - *High Category Spending Alert (>30% of total)*
    - *Budget Approaching Cap (>80%) & Exceeded (>100%)*
    - *Low Savings Rate Advisory (<15%)*
    - *Non-Essential Want Pruning Advisory (>30%)*
    - *Subscription Audit Reminder*
    - *Positive Reinforcement for Month-over-Month Reductions*
  - 4 Structured Personalized Cards:
    - 💡 **Spending Insight**
    - 🎯 **Target Budget Goal**
    - 💰 **Saving Opportunity**
    - 📊 **Category Focus**

- **🏆 Educational Financial Health Score (0–100):**
  - Transparent point allocation across:
    1. Savings Rate (up to 30 pts)
    2. Budget Adherence (up to 25 pts)
    3. Essential Needs vs. Wants Ratio (up to 25 pts)
    4. Expense Consistency & Logging Discipline (up to 20 pts)
  - Clear educational disclaimer highlighting budgeting literacy rather than commercial financial advice

- **🎨 Modern Teen-Friendly UI & Accessibility:**
  - Dark Mode and Light Mode with persistent preference storage
  - Responsive layout (mobile cards, desktop tables and sidebars)
  - Custom glassmorphism, rounded-3xl cards, and vibrant accents
  - Empty states, loading spinners, and form error validation feedback

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Recharts, Lucide Icons, Tailwind CSS |
| **Backend** | Node.js, Express.js (MVC Architecture) |
| **Database** | Supabase PostgreSQL (Foreign Keys, Indexes, Triggers, RLS) |
| **Security** | bcrypt (12 rounds), JSON Web Tokens (jsonwebtoken), Helmet, CORS, Express Rate Limit |
| **Validation** | Express-Validator (Backend), Custom Form Handlers (Frontend) |
| **Testing** | Jest, Supertest |

---

## 📂 Project Structure

```text
teen-expense-tracker/
│
├── frontend/                        # React + Vite Single Page Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── BudgetCard.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ExpenseCard.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── IncomeCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth & dark mode state
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useBudget.js
│   │   │   └── useExpenses.js
│   │   ├── pages/                   # Application views
│   │   │   ├── AddExpense.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   └── Register.jsx
│   │   ├── services/                # Axios API service callers
│   │   │   ├── analyticsService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── budgetService.js
│   │   │   ├── expenseService.js
│   │   │   └── incomeService.js
│   │   │   └── recommendationService.js
│   │   ├── utils/                   # Formatting and mathematical utilities
│   │   │   ├── calculations.js
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx                  # Route definitions
│   │   ├── index.css                # Tailwind directives & custom CSS
│   │   └── main.jsx                 # React root mount
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                         # Express.js REST API (MVC)
│   ├── database/
│   │   └── schema.sql               # PostgreSQL schema & RLS policies
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Supabase client + Dev Fallback Adapter
│   │   │   └── env.js               # Environment config loader
│   │   ├── controllers/             # Thin HTTP request controllers
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── budgetController.js
│   │   │   ├── expenseController.js
│   │   │   ├── incomeController.js
│   │   │   └── recommendationController.js
│   │   ├── middleware/              # Auth, validation & error handling
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── models/                  # Database access layer
│   │   │   ├── budgetModel.js
│   │   │   ├── expenseModel.js
│   │   │   ├── incomeModel.js
│   │   │   └── userModel.js
│   │   ├── routes/                  # Express route routers
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── incomeRoutes.js
│   │   │   └── recommendationRoutes.js
│   │   ├── services/                # Business logic layer
│   │   │   ├── analyticsService.js
│   │   │   ├── budgetService.js
│   │   │   └── recommendationService.js
│   │   ├── utils/                   # Calculations & token utilities
│   │   │   ├── calculations.js
│   │   │   └── generateToken.js
│   │   ├── validators/              # Express-validator schemas
│   │   │   ├── authValidator.js
│   │   │   ├── budgetValidator.js
│   │   │   └── expenseValidator.js
│   │   ├── app.js                   # Express app setup (Helmet, CORS, Rate Limit)
│   │   └── server.js                # HTTP server listener
│   ├── tests/
│   │   └── backend.test.js          # 20 Jest/Supertest integration tests
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                     # Root orchestrator with concurrently
└── README.md
```

---

## ⚡ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- Optional: Free account at [Supabase](https://supabase.com) (or use the built-in simulated PostgreSQL adapter for offline development)

---

## 🚀 Installation & Setup

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

*(Or simply run `npm run install:all` from the root folder)*

---

### 2. Environment Variables Configuration

#### Backend Configuration:
Create `backend/.env` (a template is provided in `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your_super_secret_jwt_random_key_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Offline/Development Mode:** If `SUPABASE_URL` is left unconfigured, the backend automatically initializes a simulated in-memory PostgreSQL engine so you can immediately register, run tests, and develop without an internet connection or Supabase account!

#### Frontend Configuration:
Create `frontend/.env` (a template is provided in `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Supabase PostgreSQL Database Setup

1. Open your project on [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor** on the left menu.
3. Open [`backend/database/schema.sql`](file:///c:/Users/Himanshu%20kashyap/OneDrive/Desktop/New%20folder/backend/database/schema.sql) and paste its entire contents into the SQL Editor.
4. Click **Run**.
5. Copy your **Project URL** and **service_role secret key** from **Project Settings → API** and paste them into `backend/.env`.

---

## 🖥️ Running the Application

### Option A: Run Both Services Concurrently (Recommended)

From the root project folder:

```bash
npm run dev
```

This starts:
- **Backend API**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173`

---

### Option B: Run Individually

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing

The backend includes a comprehensive integration test suite covering authentication, authorization, CRUD operations, user tenant data isolation, budget threshold mathematics, and recommendation calculations:

```bash
# Run backend tests
cd backend
npm test
```

### Verified Test Cases:
- `GET /api/health` — Service health checks
- `POST /api/auth/register` — User registration and password hashing
- `POST /api/auth/register` — Duplicate email rejection (409 Conflict)
- `POST /api/auth/login` — Authentication and JWT token issuance
- `POST /api/auth/login` — Bad credentials rejection (401 Unauthorized)
- `GET /api/auth/me` — Protected profile retrieval with valid token
- `GET /api/auth/me` — Unauthenticated request blocking (401 Unauthorized)
- `POST /api/expenses` — Expense creation with Need/Want tags
- `GET /api/expenses` — Paginated and filtered expense querying
- **Security Isolation:** User B cannot read User A's expense by ID (404/403)
- **Security Isolation:** User B cannot update or delete User A's expense
- `PUT /api/expenses/:id` — User A can modify their own expense
- `POST /api/income` — Income and allowance entry
- `POST /api/budgets` — Category budget upsert
- `GET /api/budgets/status` — Dynamic spent vs. budget calculation with >80% warnings
- `GET /api/analytics/summary` — Net savings and percentage calculations
- `GET /api/recommendations` — Deterministic pattern suggestions
- `GET /api/recommendations/financial-health` — 0-100 Educational Score calculation

---

## 📡 REST API Reference

All protected endpoints require the following header:
```text
Authorization: Bearer <your_jwt_token>
```

### Standard Response Format

#### Success:
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": { ... }
}
```

#### Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Amount must be a positive number greater than 0",
  "errors": [ ... ]
}
```

### API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new user account |
| **POST** | `/api/auth/login` | Public | Login with email and password |
| **GET** | `/api/auth/me` | Protected | Get authenticated profile |
| **PUT** | `/api/auth/me` | Protected | Update name, currency, income, or password |
| **GET** | `/api/expenses` | Protected | List expenses (supports search, filters, pagination) |
| **POST** | `/api/expenses` | Protected | Create new expense |
| **GET** | `/api/expenses/:id` | Protected | Get single expense |
| **PUT** | `/api/expenses/:id` | Protected | Update single expense |
| **DELETE**| `/api/expenses/:id` | Protected | Delete single expense |
| **GET** | `/api/income` | Protected | List all user income entries |
| **POST** | `/api/income` | Protected | Add income / allowance record |
| **GET** | `/api/income/:id` | Protected | Get single income entry |
| **PUT** | `/api/income/:id` | Protected | Update income entry |
| **DELETE**| `/api/income/:id` | Protected | Delete income entry |
| **GET** | `/api/budgets` | Protected | List user category budgets |
| **GET** | `/api/budgets/status` | Protected | Get budgets with live spending, remaining, & status |
| **POST** | `/api/budgets` | Protected | Create or update (upsert) category budget |
| **DELETE**| `/api/budgets/:id` | Protected | Delete category budget |
| **GET** | `/api/analytics/summary` | Protected | Monthly totals, remaining funds, savings rate |
| **GET** | `/api/analytics/categories` | Protected | Category spending breakdown and percentages |
| **GET** | `/api/analytics/monthly` | Protected | 6-month historical income vs. expense trend |
| **GET** | `/api/analytics/daily` | Protected | Day-by-day spending sequence for time-series charts |
| **GET** | `/api/analytics/comparison` | Protected | Filter by today, this_week, this_month, last_month |
| **GET** | `/api/analytics/patterns` | Protected | Daily avg, peak spending day, Wants vs. Needs split |
| **GET** | `/api/recommendations` | Protected | Rule-based suggestions and 4 structured insights |
| **GET** | `/api/recommendations/financial-health` | Protected | 0–100 educational habit score and factor breakdown |

---

## 🛡️ Security Implementation Checklist

- [x] **bcrypt Password Hashing:** 12 salt rounds applied before writing to database.
- [x] **Zero Password Leakage:** `password_hash` column is explicitly stripped from model returns and API payloads.
- [x] **JWT Stateless Authentication:** Tokens signed with secret and expiration; user identity verified per request.
- [x] **Strict Tenant Data Scoping:** Every SQL/Supabase operation requires `user_id = req.user.id`. User A can never read, modify, or delete User B's resources, even if IDs are guessed in URL paths.
- [x] **Brute-Force Rate Limiting:** `express-rate-limit` limits authentication routes to 50 requests per 15 minutes.
- [x] **Security Headers:** `helmet` sets secure HTTP response headers against clickjacking, MIME-sniffing, and XSS.
- [x] **CORS:** Configured specifically for client origin.
- [x] **Input Validation:** Rigorous backend parameter sanitization via `express-validator` paired with client-side form checking.
- [x] **Safe Secrets Management:** `.env` files ignored by `.gitignore`.

---

## 🔮 Future Improvements & Data Science Roadmap

Because this architecture records granular user spending patterns, payment channels, and Needs vs. Wants classifications, it serves as an ideal baseline for advanced data science and machine learning extensions:

1. **Spending Prediction:**
   - Train an ARIMA or Prophet time-series model to forecast month-end spending based on day-of-month velocity.
2. **Anomaly Detection:**
   - Implement an Isolation Forest algorithm to flag unusual micro-transactions or duplicate charges.
3. **Behavioral Clustering (K-Means):**
   - Cluster spending profiles into archetypes (*"The Saver"*, *"The Weekend Spender"*, *"The Subscriptions Heavy"*) to offer tailored educational guidance.
4. **Receipt Scanner (OCR):**
   - Add image parsing for physical receipts using computer vision to auto-fill title, amount, and category.

---

## 📄 License

This project is licensed under the MIT License — free for educational and personal use.
