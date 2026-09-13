# Project Requirements

## Project Name

Hunter Islamic Agro Farm Backend

## Objective

Build a secure backend API for an Islamic agro farm investment platform where users can register as investors, apply to become sharks, book admin-managed appointments, browse agricultural investment projects, purchase investment shares through Stripe, receive payment receipts, and allow admins to manage applications, schedules, projects, appointments, and platform analytics.

## User Roles

### Admin

- Manage shark applications.
- Approve users who apply to become sharks.
- Create appointment schedules.
- View appointment requests.
- Approve appointment requests and provide an appointment URL.
- Create investment projects.
- View admin analytics.
- Access own profile information.

### Investor

- Register and verify email.
- Login with email/password or Google.
- Manage profile image.
- Apply to become a shark.
- Purchase investment shares.
- View own payments.
- View own verified shares.
- Access own profile information.

### Shark

- Login and access own profile information.
- Manage profile image.
- View available schedules.
- Book appointments.
- View own appointment.
- Purchase higher-value investment shares.
- View own payments.
- View own verified shares.

## Functional Requirements

### Authentication and Authorization

- The system must support user registration with name, email, password, and optional profile information.
- The system must validate email format and enforce strong password rules.
- The system must send an OTP after registration.
- The system must verify user email using email and 6-digit OTP.
- The system must issue access and refresh tokens after successful verification or login.
- The system must store tokens in HTTP-only cookies.
- The system must support login using email and password.
- The system must support Google login using an ID token.
- The system must support forgot-password OTP flow.
- The system must support password reset using email, OTP, and new password.
- The system must allow authenticated users to fetch their own profile.
- The system must refresh tokens using the refresh token cookie.
- The system must protect role-specific endpoints using role-based authorization.

### User Profile

- The system must allow authenticated admins, investors, and sharks to upload a profile image.
- Profile image upload must use multipart form-data with the file key `profileImage`.
- Uploaded profile images must be stored through Cloudinary.
- The system must keep image URL and public ID metadata for users.

### Shark Application

- Investors and admins must be able to submit a request to become a shark.
- A shark application must move to a pending review state after submission.
- Admins must be able to view shark applications.
- Admins must be able to approve a shark application by user ID.
- After approval, the user should receive shark access according to the backend role/application workflow.

### Appointment Scheduling

- Admins must be able to create appointment schedules with a `scheduledAt` date-time.
- Schedules must have a default duration of 30 minutes.
- Sharks must be able to view schedules.
- Sharks must be able to book an appointment using a schedule ID.
- Appointment booking must support optional purpose and notes.
- A schedule can be linked to only one appointment.
- Admins must be able to view appointment requests.
- Admins must be able to approve appointment requests.
- Appointment approval must accept an `appointmentUrl`.
- Sharks must be able to view their own appointment.

### Project Management

- Admins must be able to create investment projects.
- Project creation must support title, description, image URL, location, total cost, currency, start date, and end date.
- Public users must be able to view all projects.
- Public users must be able to view a single project by ID.
- Project listing must support pagination.
- Project listing must support searching by title, description, and location.
- Project listing must support filtering by status, location, and currency.
- Project listing must support sorting by a selected field and sort order.
- Project status must support `DRAFT`, `FUNDING`, `FUNDED`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.

### Investment Payments

- Investors and sharks must be able to create a Stripe Checkout session by selecting the number of shares.
- The number of shares must be at least 1.
- Investor share price must be USD 1,000 per share.
- Shark share price must be USD 50,000 per share.
- The system must create a share record and a pending payment before redirecting to Stripe Checkout.
- The checkout response must return payment ID, share ID, share count, price per share, total amount, currency, and checkout URL.
- The system must process Stripe `checkout.session.completed` webhook events.
- After successful payment, the system must mark the payment as verified.
- The system must store Stripe session and payment intent/transaction details.
- The system must generate a PDF investment receipt after payment verification.
- The system must email the payment success message and receipt PDF to the user.
- Users must be able to view their own payments.

### Share Tracking

- Investors and sharks must be able to view their own verified shares.
- The share response must include total shares and total invested amount.
- Only shares connected to verified payments should be counted in the user's share summary.

### Admin Analytics

- Admins must be able to view dashboard analytics.
- Analytics must include total users, investors, sharks, and admins.
- Analytics must include total projects and project status counts.
- Analytics must include total purchased shares.
- Analytics must include total payments by status.
- Analytics must include total and verified investment amounts.
- Analytics must include pending and approved shark application counts.
- Analytics must include total project cost, funded amount, and funding percentage.

### Notifications and Emails

- The system must send registration verification OTP emails.
- The system must send forgot-password OTP emails.
- The system must send reset-password success emails.
- The system must send payment success emails with receipt PDFs.
- The system must support a scheduled shark application summary email/job.

## API Requirements

### Public Endpoints

| Method | Endpoint | Requirement |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register user and send OTP |
| `POST` | `/api/v1/auth/verify-email` | Verify email and return tokens |
| `POST` | `/api/v1/auth/login` | Login user |
| `POST` | `/api/v1/auth/google` | Google login |
| `POST` | `/api/v1/auth/forgot-password` | Send reset OTP |
| `POST` | `/api/v1/auth/reset-password` | Reset password |
| `POST` | `/api/v1/auth/refresh-token` | Refresh auth tokens |
| `GET` | `/api/v1/projects` | List projects |
| `GET` | `/api/v1/projects/:id` | Get single project |

### Protected User Endpoints

| Method | Endpoint | Roles |
| --- | --- | --- |
| `GET` | `/api/v1/auth/me` | Admin, Investor, Shark |
| `PATCH` | `/api/v1/user/profile-image` | Admin, Investor, Shark |
| `POST` | `/api/v1/user/apply-as-shark` | Admin, Investor |
| `GET` | `/api/v1/user/schedules` | Admin, Shark |
| `POST` | `/api/v1/user/book-appointment` | Shark |
| `GET` | `/api/v1/user/my-appointment` | Shark |

### Admin Endpoints

| Method | Endpoint | Requirement |
| --- | --- | --- |
| `GET` | `/api/v1/admin/accept-shark` | View shark applications |
| `PATCH` | `/api/v1/admin/accept-shark/:userId` | Approve shark application |
| `POST` | `/api/v1/admin/schedule` | Create appointment schedule |
| `GET` | `/api/v1/admin/appointment-requests` | View appointment requests |
| `PATCH` | `/api/v1/admin/appointment-requests/:appointmentId/approve` | Approve appointment |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/analytics/admin` | View analytics |

### Payment and Share Endpoints

| Method | Endpoint | Roles/Source |
| --- | --- | --- |
| `POST` | `/api/v1/payments/create-checkout` | Investor, Shark |
| `GET` | `/api/v1/payments/my-payments` | Investor, Shark |
| `POST` | `/api/v1/payments/webhook` | Stripe |
| `GET` | `/api/v1/share/my-shares` | Investor, Shark |

## Non-Functional Requirements

- The API must use TypeScript for type safety.
- The API must use Prisma for database modeling and queries.
- The API must use PostgreSQL as the primary database.
- The API must validate incoming request bodies where validation schemas exist.
- The API must return consistent JSON responses with status code, success flag, message, and data.
- The API must use centralized error handling.
- The API must support CORS with credentials for the configured frontend URL.
- The API must use secure password hashing with bcrypt.
- The API must use environment variables for secrets and service credentials.
- The API must integrate Redis before startup completes.
- The API must verify SMTP configuration before startup completes.
- The API must be lintable with Biome.

## Data Requirements

- User emails must be unique.
- Profile emails must be unique.
- Each user can have one profile.
- Each schedule date-time must be unique.
- Each appointment must be linked to one schedule.
- Each schedule can have only one appointment.
- Payments must be linked to a user and share.
- Shares must be linked to a user.
- Stripe session IDs, payment intent IDs, and transaction IDs must be unique when present.

## External Service Requirements

- PostgreSQL database must be available.
- Redis instance must be available.
- SMTP credentials must be configured for emails.
- Cloudinary credentials must be configured for image uploads.
- Stripe keys and webhook secret must be configured for payments.
- Google Client ID must be configured for Google authentication.

## Development Requirements

- Developers must install dependencies with `npm install`.
- Developers must configure `.env` before running the server.
- Developers must run Prisma migrations before using the API.
- Developers can import `Hunter.postman_collection.json` into Postman for API testing.
- The Postman `{{local}}` variable should point to `http://localhost:5000/api/v1`.
