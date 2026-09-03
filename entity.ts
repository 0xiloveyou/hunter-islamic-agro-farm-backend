/*

                         ┌─────────────┐
                         │    USER     │
                         └──────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
                 Profile    Investment  Appointment
                                │
                                ▼
                             Payment
                                │
                                ▼
                              Fund
                                │
                                ▼
                         FundAllocation
                                │
                                ▼
                             Project
                                │
                         ┌──────┴──────┐
                         ▼             ▼
                      Expense        Revenue

                         USER
                          │
                          ▼
                        Audit


User          1 ──── 1  Profile

User          1 ──── *  Investment

User          1 ──── *  Appointment

Investment    1 ──── *  Payment

Fund          1 ──── *  FundAllocation

Project       1 ──── *  FundAllocation

Project       1 ──── *  Expense

Project       1 ──── *  Revenue

User          1 ──── *  Audit


-------------------
model User {
  id           String   @id @default(uuid())
  googleId     String?  @unique
  email        String   @unique
  name         String?
  image        String?
  role         Role     @default(INVESTOR)
  isActive     Boolean  @default(true)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile?
  investments  Investment[]
  appointments Appointment[]
  audits       Audit[]

  @@index([role])
}

enum Role {
  ADMIN
  SHARK
  INVESTOR
}


-----


model Profile {
  id          String   @id @default(uuid())

  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  phone       String?
  country     String?
  address     String?
  occupation  String?
  companyName String?
  bio         String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}


---------------


model Investment {
  id              String            @id @default(uuid())

  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Restrict)

  amount          Decimal           @db.Decimal(18, 2)
  currency        String            @default("USD")

  status          InvestmentStatus  @default(PENDING)

  referenceNumber String            @unique

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  payments        Payment[]

  @@index([userId])
  @@index([status])
}

enum InvestmentStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
}

---------

model Payment {
  id            String        @id @default(uuid())

  investmentId  String
  investment    Investment    @relation(fields: [investmentId], references: [id], onDelete: Restrict)

  amount        Decimal       @db.Decimal(18, 2)
  currency      String        @default("USD")

  method        PaymentMethod
  transactionId String?       @unique

  proofUrl      String?

  status        PaymentStatus @default(PENDING)

  paidAt        DateTime?
  verifiedAt    DateTime?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([investmentId])
  @@index([status])
}

enum PaymentMethod {
  BANK_TRANSFER
  MOBILE_MONEY
  CARD
  OTHER
}

enum PaymentStatus {
  PENDING
  VERIFIED
  FAILED
  REFUNDED
}


-----------


model Project {
  id             String        @id @default(uuid())

  name           String
  description    String?

  country        String
  region         String?
  location       String?

  targetAmount   Decimal       @db.Decimal(18, 2)
  currency       String        @default("USD")

  status         ProjectStatus @default(PLANNING)

  startDate      DateTime?
  expectedEndDate DateTime?

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  allocations    FundAllocation[]
  expenses       Expense[]
  revenues       Revenue[]

  @@index([country])
  @@index([status])
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}

-----------

model Appointment {
  id           String            @id @default(uuid())

  userId       String
  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  scheduledAt  DateTime

  purpose      String?
  notes        String?

  status       AppointmentStatus @default(PENDING)

  meetingLink  String?
  documentUrl  String?

  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([userId])
  @@index([scheduledAt])
  @@index([status])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  RESCHEDULED
}


----------

model Fund {
  id             String       @id @default(uuid())

  name           String
  description    String?

  totalReceived  Decimal      @default(0) @db.Decimal(18, 2)
  totalAllocated Decimal      @default(0) @db.Decimal(18, 2)
  totalAvailable Decimal      @default(0) @db.Decimal(18, 2)

  currency       String       @default("USD")
  status         FundStatus   @default(ACTIVE)

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  allocations    FundAllocation[]
}

enum FundStatus {
  ACTIVE
  CLOSED
}

-------------

model FundAllocation {
  id          String   @id @default(uuid())

  fundId      String
  fund        Fund     @relation(fields: [fundId], references: [id], onDelete: Restrict)

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)

  amount      Decimal  @db.Decimal(18, 2)
  currency    String   @default("USD")

  note        String?

  allocatedAt DateTime @default(now())

  @@index([fundId])
  @@index([projectId])
}

-----------

model Audit {
  id        String   @id @default(uuid())

  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  action    String
  entity    String
  entityId  String?

  oldValue  Json?
  newValue  Json?

  ipAddress String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([entity])
  @@index([entityId])
  @@index([createdAt])
}

----------

model Expense {
  id          String   @id @default(uuid())

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)

  title       String
  description String?

  amount      Decimal  @db.Decimal(18, 2)
  currency    String   @default("USD")

  expenseDate DateTime

  receiptUrl  String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
  @@index([expenseDate])
}


-----------

model Revenue {
  id          String   @id @default(uuid())

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)

  source      String
  description String?

  amount      Decimal  @db.Decimal(18, 2)
  currency    String   @default("USD")

  revenueDate DateTime

  documentUrl String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
  @@index([revenueDate])
}

----------




*/
