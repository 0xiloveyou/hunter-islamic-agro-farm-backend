# Hunter Islamic Agro Farm Backend

Backend API for the Hunter Islamic Agro Farm investment platform. The system supports investor and shark registration, email verification, Google login, role-based access, shark applications, appointment scheduling, investment project listing, Stripe checkout, share tracking, payment receipts, and admin analytics.

![ERD Diagram](<ERD Diagram.png>)

## Tech Stack

- Node.js, Express 5, TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication with access and refresh tokens
- Redis for OTP/session-supporting workflows
- Nodemailer and EJS email templates
- Cloudinary and Multer for profile image upload
- Stripe Checkout and Stripe webhooks for investment payments
- PDFKit for payment receipt PDF generation
- Biome for linting

## Base URL

Local API base URL:

```txt
http://localhost:5000/api/v1
```

The Postman collection uses the `{{local}}` variable. Set it to:

```txt
http://localhost:5000/api/v1
```

## Installation

```bash
npm install
```

Create a `.env` file in the project root and provide the required environment variables listed below.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Build and run production output:

```bash
npm run build
npm start
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with `tsx watch` |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server from `dist/src/server.js` |
| `npm run lint:check` | Check source files with Biome |
| `npm run lint:fix` | Fix lint issues with Biome |
| `npm run stripe:webhook` | Forward Stripe webhook events to the local API |

## Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id

TESTER_ADMIN_NAME=Admin
TESTER_ADMIN_EMAIL=admin@example.com
TESTER_ADMIN_PASSWORD=Password@123
TESTER_INVESTOR_NAME=Investor
TESTER_INVESTOR_EMAIL=investor@example.com
TESTER_INVESTOR_PASSWORD=Password@123
TESTER_SHARK_NAME=Shark
TESTER_SHARK_EMAIL=shark@example.com
TESTER_SHARK_PASSWORD=Password@123

REDIS_USER=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_SENDER="Hunter Islamic Agro Farm <no-reply@example.com>"

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

On server startup, the app connects to PostgreSQL, seeds tester admin/investor/shark accounts from environment variables, connects Redis, verifies Nodemailer, and starts the shark application summary cron job.

## Authentication

Authenticated routes use JWT. The API sets `accessToken` and `refreshToken` as HTTP-only cookies after login, email verification, Google login, and refresh-token calls. Protected endpoints also expect the authenticated user to have one of the allowed roles.

Roles:

- `ADMIN`
- `INVESTOR`
- `SHARK`

## API Endpoints

### Health

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Welcome/health response |

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register a user and send email verification OTP |
| `POST` | `/api/v1/auth/verify-email` | Public | Verify email with OTP and receive tokens |
| `POST` | `/api/v1/auth/login` | Public | Login with email and password |
| `POST` | `/api/v1/auth/google` | Public | Login/register using Google ID token |
| `POST` | `/api/v1/auth/forgot-password` | Public | Send password reset OTP |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password with OTP |
| `GET` | `/api/v1/auth/me` | Admin, Investor, Shark | Get current authenticated user |
| `POST` | `/api/v1/auth/refresh-token` | Refresh cookie | Issue new access and refresh tokens |

Register example:

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "Password@123",
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "country": "Bangladesh",
    "address": "Dhaka, Bangladesh",
    "bio": "Software Developer"
  }
}
```

Password rules: minimum 8 characters, at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.

### User

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `PATCH` | `/api/v1/user/profile-image` | Admin, Investor, Shark | Upload profile image using form-data key `profileImage` |
| `POST` | `/api/v1/user/apply-as-shark` | Admin, Investor | Submit a shark application |
| `GET` | `/api/v1/user/schedules` | Admin, Shark | Get available schedules |
| `POST` | `/api/v1/user/book-appointment` | Shark | Book an appointment against a schedule |
| `GET` | `/api/v1/user/my-appointment` | Shark | Get the authenticated shark's appointment |

Book appointment example:

```json
{
  "scheduleId": "d5154012-29b9-45c2-b9ab-3d917a245217",
  "purpose": "Discuss investment opportunities",
  "notes": "I would like to discuss the agricultural investment projects."
}
```

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/accept-shark` | Admin | Get pending shark applications |
| `PATCH` | `/api/v1/admin/accept-shark/:userId` | Admin | Approve a shark application |
| `POST` | `/api/v1/admin/schedule` | Admin | Create a meeting schedule |
| `GET` | `/api/v1/admin/appointment-requests` | Admin | Get appointment requests |
| `PATCH` | `/api/v1/admin/appointment-requests/:appointmentId/approve` | Admin | Approve an appointment and attach meeting URL |

Create schedule example:

```json
{
  "scheduledAt": "2026-09-15T10:00:00.000Z"
}
```

Approve appointment example:

```json
{
  "appointmentUrl": "https://example.com/appointment/d815f636-11d1-4db6-a4e5-d85d340eff2a"
}
```

### Projects

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/projects` | Admin | Create an investment project |
| `GET` | `/api/v1/projects` | Public | Get projects with pagination, search, filter, and sorting |
| `GET` | `/api/v1/projects/:id` | Public | Get a single project |

Create project example:

```json
{
  "title": "Uganda 3,000 Acre Maize Farm",
  "description": "Large-scale maize farming project in Uganda.",
  "imageUrl": "https://example.com/uganda-farm.jpg",
  "location": "Uganda",
  "totalCost": 2500000,
  "currency": "USD",
  "startDate": "2026-10-01",
  "endDate": "2029-10-01"
}
```

Project list query parameters:

| Query | Description |
| --- | --- |
| `page` | Page number, default `1` |
| `limit` | Items per page, default `10` |
| `searchTerm` | Search title, description, and location |
| `status` | Filter by `DRAFT`, `FUNDING`, `FUNDED`, `IN_PROGRESS`, `COMPLETED`, or `CANCELLED` |
| `location` | Filter by location |
| `currency` | Filter by currency |
| `sortBy` | Sort field, default `createdAt` |
| `sortOrder` | `asc` or `desc`, default `desc` |

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/payments/create-checkout` | Investor, Shark | Create Stripe Checkout session for shares |
| `GET` | `/api/v1/payments/my-payments` | Investor, Shark | Get authenticated user's payments |
| `POST` | `/api/v1/payments/webhook` | Stripe | Process completed Stripe checkout sessions |

Create checkout example:

```json
{
  "numberOfShares": 2
}
```

Share pricing:

- Investor: USD 1,000 per share
- Shark: USD 50,000 per share

After a successful Stripe checkout, the webhook verifies the payment, stores transaction details, generates a PDF receipt, and emails the receipt to the user.

### Shares

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/share/my-shares` | Investor, Shark | Get verified shares, total shares, and total invested amount |

### Analytics

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/analytics/admin` | Admin | Get dashboard analytics for users, projects, shares, payments, investments, and shark applications |

## Main Data Models

- `User`: account, role, status, auth provider, email verification, shark application status, and profile image metadata.
- `Profile`: user profile details such as phone, country, address, and bio.
- `Project`: agricultural investment project with cost, funded amount, currency, dates, and status.
- `Schedule`: admin-created appointment slot.
- `Appointment`: shark appointment request linked to a schedule.
- `Share`: purchased share record connected to a user and payments.
- `Payment`: Stripe/payment transaction connected to a share and user.

## Postman Collection

The API examples are available in:

```txt
Hunter.postman_collection.json
```

Import the collection into Postman and set `{{local}}` to `http://localhost:5000/api/v1`.
