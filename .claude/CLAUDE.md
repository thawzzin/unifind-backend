# UniFind Backend — Claude Code Instructions

## 1. Project Overview

UniFind is a university campus Lost & Found system.

This repository contains the backend API used by:

* `unifind-client` — Student and Staff application
* `unifind-admin-panel` — Administrator application

The backend is a shared REST API and must remain independent of either frontend.

The system should prioritize:

* Simplicity
* Maintainability
* Security
* Clear API contracts
* Good developer experience
* Appropriate scalability
* Minimal unnecessary complexity

Do not over-engineer the application for hypothetical future requirements.

---

## 2. Technology Stack

Use the following technologies unless explicitly instructed otherwise:

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT
* bcrypt
* typescript

Supporting libraries may include:

* dotenv
* cors
* helmet
* morgan
* express-validator
* multer

Do not introduce additional infrastructure or dependencies without a clear reason.

Do not switch to TypeScript unless explicitly requested.

---

## 3. Development Philosophy

Build UniFind incrementally.

The application MUST be developed feature by feature.

Never attempt to implement the entire application in one step.

Each feature should be small enough to:

1. Understand
2. Implement
3. Test
4. Review
5. Commit independently

After completing the requested feature:

* Verify the implementation.
* Check for obvious issues.
* Explain what changed.
* Suggest a Git commit message.
* STOP.

Do not automatically continue to another feature.

---

## 4. Feature Scope Rule

Only implement what is explicitly requested.

For example, if the requested feature is:

> Implement user registration.

Do NOT also implement:

* Login
* JWT refresh tokens
* Password reset
* Email verification
* User profile
* Admin authentication

unless they are explicitly requested as part of the same feature.

If a requested feature requires another feature that does not exist yet, explain the dependency before implementing it.

Do not silently build unrelated prerequisites.

---

## 5. Architecture

Use a layered architecture:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

### Routes

Responsible for:

* Defining endpoints
* Applying middleware
* Connecting endpoints to controllers

Routes should contain minimal logic.

### Controllers

Responsible for:

* Reading request data
* Calling services
* Returning HTTP responses

Controllers should remain thin.

Do not put business logic inside controllers.

### Services

Responsible for:

* Business logic
* Business rules
* Coordinating repositories
* Transactions when necessary

### Repositories

Responsible for:

* Database access
* Prisma queries
* Data persistence

Do not put business rules inside repositories.

### Middleware

Responsible for cross-cutting concerns such as:

* Authentication
* Authorization
* Validation
* Error handling
* Request processing

---

## 6. Project Organization

Prefer feature-oriented organization where appropriate while maintaining clear separation of responsibilities.

A typical structure is:

```text
src/
├── config/
├── constants/
├── controllers/
├── middlewares/
├── repositories/
├── routes/
├── services/
├── validators/
├── utils/
└── prisma/
```

Do not create folders simply for the sake of having more folders.

Use the simplest structure that keeps responsibilities clear.

---

## 7. Database

PostgreSQL is the primary database.

Prisma is the only database access layer.

Application code should not use raw PostgreSQL queries unless there is a specific technical reason.

Before adding a database field, consider:

* Is it actually required?
* Is it nullable?
* Does it need an index?
* Does it belong in another table?
* Does it represent business state or temporary workflow state?

Prefer normalized relational data.

Avoid premature denormalization.

---

## 8. UniFind Core Concepts

### User Roles

UniFind has three roles:

```text
STUDENT
STAFF
ADMIN
```

### Item Types

```text
LOST
FOUND
```

### Lost Item Status

Keep the lifecycle simple:

```text
ACTIVE
RECOVERED
```

### Found Item Status

Keep the lifecycle simple:

```text
AVAILABLE
RETURNED
```

Do not introduce unnecessary item statuses such as:

* MATCHED
* CLAIMED
* PENDING
* VERIFIED

Claims are a separate workflow and should not unnecessarily complicate item status.

### Claim Status

Claims may have their own state, such as:

```text
PENDING
APPROVED
REJECTED
```

Only add additional states when the actual product requirement requires them.

---

## 9. API Design

Build a REST API.

Use clear resource-oriented endpoints.

Example:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

POST   /api/claims
GET    /api/claims/my
PATCH  /api/claims/:id
```

Admin-specific endpoints should be clearly separated.

For example:

```text
GET    /api/admin/users
GET    /api/admin/items
GET    /api/admin/claims
```

Follow REST conventions consistently.

---

## 10. API Responses

Use a consistent response structure.

Successful response:

```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Item not found",
  "data": null
}
```

Do not create a different response structure for every endpoint.

---

## 11. Validation

Validate all external input.

Never trust:

* Request body
* Query parameters
* Route parameters
* Headers
* Uploaded files

Use the project's chosen validation library consistently.

Validation should happen before business logic.

Return clear validation errors.

---

## 12. Authentication

Authentication uses JWT.

Passwords must never be stored in plain text.

Use bcrypt for password hashing.

Protected endpoints must verify authentication through middleware.

Do not rely on the frontend to enforce security.

The backend MUST enforce:

* Authentication
* Authorization
* Role permissions
* Ownership checks

For example:

A student must not be able to modify another student's item simply by changing the item ID.

---

## 13. Authorization

Use role-based authorization.

Example:

```text
STUDENT
  ↓
Own reports
Own claims

STAFF
  ↓
Own reports
Own claims

ADMIN
  ↓
Administrative operations
```

Always enforce authorization on the backend.

Frontend route protection is only a UX feature, not a security mechanism.

---

## 14. Ownership

When an operation modifies or deletes a resource belonging to a user:

1. Authenticate the user.
2. Retrieve the resource.
3. Verify ownership.
4. Perform the operation.

Never trust a `userId` supplied by the client when the authenticated user ID is already available from JWT authentication.

Use the authenticated user's identity instead.

---

## 15. Pagination

List endpoints should support pagination where appropriate.

Example:

```text
GET /api/items?page=1&limit=20
```

Avoid returning unlimited database records.

Use sensible defaults.

For example:

```text
page = 1
limit = 20
```

Always enforce a maximum limit.

---

## 16. Searching and Filtering

Search and filtering should be handled by the backend.

Example:

```text
GET /api/items
  ?type=FOUND
  &categoryId=123
  &status=AVAILABLE
  &keyword=wallet
  &page=1
  &limit=20
```

Do not fetch all records and filter them in application memory unless there is a specific reason.

---

## 17. Error Handling

Use centralized error handling.

Controllers and services should throw meaningful errors.

A global error middleware should convert errors into consistent HTTP responses.

Do not expose:

* Database credentials
* JWT secrets
* Stack traces
* Internal implementation details

in production responses.

---

## 18. Security Principles

Always consider:

* Authentication
* Authorization
* Input validation
* Password hashing
* CORS
* Helmet
* Rate limiting where appropriate
* Secure file uploads
* Sensitive data exposure
* Ownership checks

Never trust client-provided role information.

Never allow users to assign themselves `ADMIN`.

Never return password hashes in API responses.

Never commit secrets to Git.

---

## 19. File Uploads

Item images are user-provided content.

Validate:

* File type
* File size
* Number of files

Do not blindly trust the file extension.

The storage implementation should be separated from item business logic.

If external object storage is introduced later, the item service should not need to be rewritten significantly.

---

## 20. Prisma Guidelines

Use Prisma consistently.

Prefer:

* Explicit relations
* Appropriate indexes
* Transactions for multi-step operations
* `select` when sensitive or unnecessary fields should be excluded

Avoid:

* N+1 queries
* Fetching unnecessary columns
* Unbounded queries
* Unnecessary transactions

When modifying the schema:

1. Update Prisma schema.
2. Create a migration.
3. Test the migration.
4. Update affected services/repositories.

Never modify the database manually without updating the Prisma schema and migration history.

---

## 21. Dependency Rules

Before installing a new package, ask:

1. Do we actually need it?
2. Can the existing stack solve the problem?
3. Does it introduce unnecessary complexity?
4. Is it actively maintained?

Prefer existing dependencies over adding new ones.

Do not install libraries just because they are popular.

---

## 22. Testing

When a feature introduces important business logic, add appropriate tests.

Prioritize testing:

* Authentication
* Authorization
* Ownership
* Claims
* Item status transitions
* Validation
* Important service logic

Do not create meaningless tests that simply increase coverage numbers.

---

## 23. Git Workflow

Each completed feature should be independently commit-able.

Prefer commits such as:

```text
feat(auth): add user registration
feat(auth): add user login
feat(items): create lost item endpoint
feat(items): add item search
feat(claims): create claim endpoint
fix(items): prevent users from editing other users' items
```

Avoid giant commits such as:

```text
feat: complete backend
```

Do not create commits automatically unless explicitly asked.

---

## 24. Code Quality

Prefer:

* Clear names
* Small functions
* Thin controllers
* Focused services
* Reusable utilities
* Explicit business rules
* Consistent error handling

Avoid:

* Giant files
* Giant functions
* Deep nesting
* Clever abstractions
* Premature optimization
* Duplicate business logic
* Unnecessary design patterns

Readable code is more important than clever code.

---

## 25. When Requirements Are Unclear

Do not make large assumptions.

If ambiguity could significantly affect:

* Database design
* API contracts
* Authentication
* Authorization
* User workflow
* Data integrity

Stop and ask for clarification.

For small implementation details, use reasonable defaults and continue.

---

## 26. Feature Development Workflow

For every feature, follow this process:

### Step 1 — Understand

Read:

```text
CLAUDE.md
PROJECT_RULES.md
ARCHITECTURE.md
ROADMAP.md
```

Understand the existing implementation before modifying it.

### Step 2 — Plan

Briefly identify:

* Files to create
* Files to modify
* Database changes
* API changes
* Dependencies

### Step 3 — Implement

Implement ONLY the requested feature.

### Step 4 — Verify

Check:

* Syntax
* Lint
* Build
* Tests where applicable
* Database migration where applicable

### Step 5 — Review

Check for:

* Duplicated code
* Security problems
* Incorrect authorization
* Unnecessary complexity
* Breaking existing functionality

### Step 6 — Report

Tell me:

* What was implemented
* Files changed
* How it works
* Verification performed
* Suggested commit message

### Step 7 — STOP

Do not continue to another feature.

Wait for the next instruction.

---

## 27. Important Final Rule

Do not optimize for building UniFind as quickly as possible.

Optimize for building it:

* Correctly
* Simply
* Incrementally
* Securely
* Maintainably

Every feature should leave the repository in a stable state that can be committed independently.
