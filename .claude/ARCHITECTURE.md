UniFind Backend — Architecture

1. Overview

UniFind is a university campus Lost & Found system.

This repository contains the shared backend API used by two separate frontend applications:

unifind-client — Student and Staff application

unifind-admin-panel — Administrator application

The backend is implemented as a modular monolith using Node.js, Express.js, and TypeScript.

The architecture should prioritize:

Simplicity

Maintainability

Security

Clear separation of concerns

Consistent API contracts

Appropriate scalability

Easy feature-by-feature development

Do not introduce unnecessary enterprise architecture or infrastructure for hypothetical future requirements.

2. Technology Stack

Runtime

Node.js

Framework

Express.js

Database

PostgreSQL

ORM

Prisma

Authentication

JWT

Password Hashing

bcrypt

Language

TypeScript

Supporting Libraries

The project may use:

dotenv

cors

helmet

morgan

express-validator

multer

Additional dependencies should only be introduced when they provide clear value.

TypeScript Rules

TypeScript is required throughout the backend application.

Use strict TypeScript configuration.

Prefer explicit domain and API types where they improve clarity.

Avoid any.

Use unknown for untrusted values when the type is not yet known.

Type Express request data where appropriate.

Use Prisma-generated types for database entities when suitable.

Do not duplicate Prisma-generated types unnecessarily.

Keep transport/request types separate from database models when their shapes differ.

Use enums or typed constants consistently for roles, item types, and statuses.

Ensure the project passes TypeScript type checking before a feature is considered complete.

3. Architectural Style

UniFind uses a modular monolith with layered architecture.

The primary request flow is:

Client
  ↓
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

Each layer has a specific responsibility.

The architecture should make it possible to change one layer without unnecessarily affecting the others.

4. High-Level System Architecture

┌──────────────────────────────┐
│       unifind-client         │
│                              │
│       Students / Staff       │
└───────────────┬──────────────┘
                │
                │ HTTP / REST
                ▼
┌──────────────────────────────────────────┐
│                                          │
│            UniFind Backend               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Routes                             │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │ Middleware                         │  │
│  │ Auth / Authorization / Validation  │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │ Controllers                        │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │ Services                           │  │
│  │ Business Logic                     │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │ Repositories                       │  │
│  │ Database Access                    │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │ Prisma                             │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
└───────────────────┼──────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │     PostgreSQL      │
          └─────────────────────┘

┌──────────────────────────────┐
│     unifind-admin-panel      │
│                              │
│        Administrators        │
└───────────────┬──────────────┘
                │
                │ HTTP / REST
                └──────────────► Same UniFind Backend

Both frontend applications consume the same backend API.

There should not be a separate backend for the client and admin panel.

5. Modular Monolith

The backend should initially remain a single application.

Conceptually, the backend contains modules such as:

Authentication
Users
Items
Categories
Claims
Uploads
Administration

These modules share:

One Express application

One PostgreSQL database

One Prisma client

One deployment

Do not split these into microservices unless there is a concrete requirement.

6. Layer Responsibilities

Routes

Routes define API endpoints.

Responsibilities:

HTTP methods

URL paths

Middleware

Controller mapping

Example:

router.post(
  '/',
  authenticate,
  validate(createItemSchema),
  itemController.create
);

Routes should not:

Contain business logic

Perform Prisma queries

Contain complex data processing

Middleware

Middleware handles cross-cutting concerns.

Examples:

Authentication

Authorization

Validation

Error Handling

Request Logging

File Upload Processing

Example request flow:

Request
  ↓
authenticate
  ↓
authorize
  ↓
validate
  ↓
controller

Middleware should be reusable.

Controllers

Controllers translate HTTP requests into application operations.

Responsibilities:

Read request data

Call services

Return HTTP responses

Example:

const create = async (req: Request, res: Response) => {
  const item = await itemService.create({
    userId: req.user.id,
    ...req.body
  });

  return res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: item
  });
};

Controllers should remain thin.

Controllers should not:

Perform Prisma queries

Contain complex business logic

Implement authorization rules

Coordinate multiple database operations directly

Services

Services contain business and application logic.

Examples:

AuthService

UserService

ItemService

ClaimService

CategoryService

Services are responsible for rules such as:

Whether a user can create an item

Whether a user owns an item

Whether an item can be updated

Whether a claim can be submitted

Whether a claim can be approved

Whether an item status should change

Whether multiple database operations require a transaction

Services should not depend on Express request or response objects.

Avoid req.body, req.params, res.json(), or res.status() inside services.

Repositories

Repositories isolate database access.

Examples:

itemRepository

userRepository

claimRepository

categoryRepository

Repositories are responsible for:

Prisma queries

Database reads

Database writes

Query composition

Data persistence

Repositories should not:

Access req or res

Handle HTTP status codes

Perform authentication

Decide whether a user is authorized

Contain unrelated business rules

Prisma

Prisma is the application's ORM and database access layer.

The normal flow is:

Service
  ↓
Repository
  ↓
Prisma Client
  ↓
PostgreSQL

Do not access Prisma directly from controllers.

Avoid direct Prisma access from middleware unless there is a specific architectural reason.

7. Project Structure

Recommended backend structure:

unifind-backend/
│
├── .claude/
│   ├── CLAUDE.md
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_RULES.md
│   └── agents/
│       ├── backend-architect.md
│       ├── prisma-expert.md
│       ├── api-reviewer.md
│       └── security-reviewer.md
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

Keep the structure simple.

Do not create additional architectural layers without a real need.

8. Application Entry Points

src/app.ts

Responsible for creating and configuring the Express application.

It should configure:

Express

JSON parsing

CORS

Helmet

Logging

Routes

Error handling

It should not start the HTTP server.

src/server.ts

Responsible for starting the server.

Conceptually:

server.ts
   ↓
import app
   ↓
connect/start application
   ↓
listen()

Keeping app.ts separate from server.ts makes testing easier.

9. Configuration Architecture

Configuration belongs in:

src/config/

Examples:

environment.ts
database.ts

Environment variables should be loaded and validated centrally.

Avoid accessing process.env throughout the entire application.

Prefer:

process.env
    ↓
configuration module
    ↓
application

10. Constants

Application constants belong in:

src/constants/

Examples:

roles.ts
item-status.ts
claim-status.ts
item-type.ts

Example:

export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

Avoid scattering magic strings throughout the codebase.

11. Validators

Request validation belongs in:

src/validators/

Examples:

auth.validator.ts
item.validator.ts
claim.validator.ts
category.validator.ts
user.validator.ts

Validation should happen before business logic.

Request flow:

Request
  ↓
Validation
  ↓
Controller
  ↓
Service

Do not depend on database errors as the primary validation mechanism.

12. Authentication Architecture

UniFind uses JWT authentication.

Authentication flow:

User
  ↓
Register
  ↓
Validate Input
  ↓
Hash Password
  ↓
Create User

Login:

User
  ↓
Login
  ↓
Find User
  ↓
Compare Password
  ↓
Generate JWT
  ↓
Return Token

Authenticated request:

Client
  ↓
Authorization: Bearer <token>
  ↓
Authentication Middleware
  ↓
Verify JWT
  ↓
Extract User ID / Role
  ↓
Attach authenticated user to request
  ↓
Authorization
  ↓
Controller

Example:

req.user = {
  id: userId,
  role: userRole
};

The backend must determine the authenticated user's identity.

Never trust req.body.userId, req.query.userId, or req.params.userId when the authenticated user identity is already available.

13. Authorization Architecture

Authentication and authorization are separate concerns.

Authentication answers:

Who is the user?

Authorization answers:

Is this user allowed to perform this operation?

Example:

authenticate
      ↓
authorize('ADMIN')
      ↓
adminController

Authorization must be enforced by the backend.

Frontend route protection is only a user experience feature.

It is not a security boundary.

14. User Roles

UniFind has three roles:

STUDENT
STAFF
ADMIN

Student

Can:

Create own lost/found reports

Manage own reports

Submit claims

Manage own claims

View public item information

Staff

Can:

Create own lost/found reports

Manage own reports

Submit claims

Manage own claims

View public item information

Additional staff permissions should only be introduced if required by the product.

Admin

Can:

Manage users

Manage categories

Moderate reports

Manage claims

Access administrative functionality

Do not allow normal users to assign themselves ADMIN.

15. Ownership Architecture

User-owned resources must enforce ownership.

Example:

PATCH /api/items/:id

Request flow:

Authenticate user
      ↓
Find item
      ↓
Check item.userId === req.user.id
      ↓
Allow update

If ownership fails:

403 Forbidden

Do not assume possession of an ID grants permission to modify the resource.

16. Item Architecture

Lost and found items share many attributes.

Use a shared Item model with a type field instead of completely separate LostItem and FoundItem models unless future requirements justify splitting them.

Example:

Item
├── id
├── title
├── description
├── type
├── status
├── categoryId
├── userId
├── location
├── itemDate
├── color
├── brand
├── reward
├── storageLocation
├── hiddenIdentifyingDetails
├── createdAt
└── updatedAt

Not every field is required for every item type.

Validation rules should determine which fields are required for:

LOST
FOUND

17. Item Types

Supported item types:

LOST
FOUND

Prefer a shared endpoint:

POST /api/items

with a type field rather than duplicating the full API for lost and found items.

This reduces duplicated API logic.

18. Lost Item Architecture

A lost item may contain:

Title

Description

Category

Color

Brand

Location Lost

Date Lost

Images

Reward

The backend should expose only information appropriate for public viewing.

19. Found Item Architecture

A found item may contain:

Title

Description

Category

Location Found

Date Found

Images

Stored At

Hidden Identifying Details

hiddenIdentifyingDetails is private information.

It should not be included in normal public item responses.

It may be used internally to help verify a claim.

20. Item Status Architecture

Keep item status intentionally simple.

Lost items:

ACTIVE
RECOVERED

Lifecycle:

ACTIVE
  ↓
RECOVERED

Found items:

AVAILABLE
RETURNED

Lifecycle:

AVAILABLE
  ↓
RETURNED

Do not use item status to represent the entire claim workflow.

Avoid adding MATCHED, CLAIMED, PENDING, or VERIFIED unless a specific requirement requires them.

21. Claim Architecture

Claims represent a user's attempt to establish ownership of an item.

Relationship:

User
  │
  │ submits
  ▼
Claim
  │
  │ references
  ▼
Item

A claim may contain:

id
itemId
claimerId
status
answer
createdAt
updatedAt

The exact fields may evolve as product requirements become clearer.

22. Claim Lifecycle

Keep claim status simple:

PENDING
APPROVED
REJECTED

Lifecycle:

             ┌─────────────► APPROVED
             │
PENDING ─────┤
             │
             └─────────────► REJECTED

Do not add unnecessary states.

23. Claim Approval

When a claim is approved, the related item may need to be marked as returned.

Example:

Admin / Authorized Staff
        ↓
Review Claim
        ↓
Approve Claim
        ↓
Claim = APPROVED
        ↓
Item = RETURNED

If multiple database operations must remain consistent, use a Prisma transaction.

24. Category Architecture

Categories are reusable reference data.

Examples:

Electronics

Documents

Clothing

Accessories

Keys

Bags

Wallets

Other

Categories should be stored in PostgreSQL.

Do not hardcode category lists throughout the frontend.

The admin panel can manage categories.

25. Image Architecture

Images should be modeled separately from the main Item entity.

Conceptually:

Item
  │
  ├── Image
  ├── Image
  └── Image

An image record should generally contain:

id
itemId
imageUrl
createdAt

Do not store large raw image binaries directly in the Item table.

26. Image Storage

The backend should keep storage implementation separate from item business logic.

The system may initially use local storage during development.

A production implementation may use object storage such as an S3-compatible service.

Conceptually:

Item Service
     ↓
Image Storage Service
     ↓
Storage Provider

This allows the storage provider to change without rewriting item business logic.

27. Search Architecture

Searching should happen at the database level.

Example:

GET /api/items?keyword=wallet

Flow:

Request
  ↓
Validate Query
  ↓
Item Service
  ↓
Item Repository
  ↓
Prisma Query
  ↓
PostgreSQL
  ↓
Filtered Results

Do not retrieve every item and filter the results in application memory.

28. Filtering Architecture

Supported filters may include:

type
categoryId
status
location
date
keyword

Example:

GET /api/items
  ?type=FOUND
  &categoryId=123
  &status=AVAILABLE
  &keyword=wallet
  &page=1
  &limit=20

All filters should be optional.

The repository should build the database query based on validated filters.

29. Pagination Architecture

Collection endpoints should use pagination.

Example:

GET /api/items?page=1&limit=20

Recommended defaults:

page = 1
limit = 20

Always enforce a maximum limit.

Example response:

{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

Do not return unlimited records.

30. API Resource Structure

Primary resources:

/api/auth
/api/users
/api/items
/api/categories
/api/claims
/api/uploads
/api/admin

Use resource-oriented naming.

Prefer:

GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

Avoid action-based endpoint names such as /getItems or /createItem.

31. Admin API Architecture

The admin panel uses the same backend.

Admin endpoints should be protected by:

authenticate
      ↓
authorize('ADMIN')
      ↓
admin controller

Examples:

GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/items
DELETE /api/admin/items/:id
GET    /api/admin/claims
PATCH  /api/admin/claims/:id
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
DELETE /api/admin/categories/:id

Exact endpoints should be introduced feature by feature.

Do not implement all admin APIs upfront.

32. API Response Architecture

Use a consistent response structure.

Successful response:

{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": "123"
  }
}

Error response:

{
  "success": false,
  "message": "Item not found",
  "data": null
}

For list endpoints:

{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [],
    "pagination": {}
  }
}

Avoid creating different response formats for different modules without a reason.

33. Error Architecture

Errors should flow through centralized error handling.

Expected flow:

Repository
    ↓
Service
    ↓
Application Error
    ↓
Controller
    ↓
Error Middleware
    ↓
HTTP Response

Do not expose internal implementation details.

Technical errors should be logged internally while clients receive safe messages.

34. HTTP Status Codes

Use appropriate HTTP status codes.

Common examples:

200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error

Do not return HTTP 200 for every response.

35. Database Architecture

PostgreSQL is the source of truth for application data.

Prisma manages database access.

General flow:

Application
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL

Database schema changes must be tracked through Prisma migrations.

36. Database Indexing

Indexes should be based on real query patterns.

Potentially indexed fields may include:

User.email
User.studentId
Item.userId
Item.categoryId
Item.type
Item.status
Item.createdAt
Claim.itemId
Claim.claimerId
Claim.status

Do not blindly index every field.

37. Prisma Relations

Use explicit Prisma relations.

Typical relationships:

User
  │
  ├── Items
  │
  └── Claims

Category
  │
  └── Items

Item
  │
  ├── Images
  │
  └── Claims

Conceptually:

User 1 ──────── * Item
Category 1 ──── * Item
Item 1 ──────── * Image
Item 1 ──────── * Claim
User 1 ──────── * Claim

38. Transactions

Use transactions when several database operations must succeed together.

Example:

Approve Claim

BEGIN
    Update Claim
    Update Item
COMMIT

If one operation fails:

ROLLBACK

Do not use transactions for every database query.

39. Query Performance

Initial performance strategy:

Use proper database indexes.

Use efficient Prisma queries.

Select only required fields.

Use pagination.

Avoid N+1 queries.

Avoid unnecessary relations.

Filter at the database level.

Do not introduce caching before measuring a real performance problem.

40. Caching

Caching is not part of the initial architecture.

Do not introduce Redis or another cache simply because it is commonly used.

If performance measurements later demonstrate that caching is necessary, introduce it deliberately.

41. Scaling Architecture

The initial backend should remain a modular monolith.

A possible future deployment architecture is:

                 Load Balancer
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    API Instance 1           API Instance 2
          │                         │
          └────────────┬────────────┘
                       ▼
                  PostgreSQL
                       │
                       ▼
                 Object Storage

The application should remain stateless where practical so multiple API instances can be introduced later.

Do not implement this infrastructure during initial development unless required.

42. Security Architecture

Security should be layered.

Request flow:

Request
  ↓
CORS
  ↓
Helmet
  ↓
Request Validation
  ↓
Authentication
  ↓
Authorization
  ↓
Ownership Checks
  ↓
Business Logic
  ↓
Database

Important principles:

Never trust client input.

Never trust client-provided roles.

Never trust client-provided user IDs for ownership.

Hash passwords.

Protect JWT secrets.

Validate uploaded files.

Do not expose sensitive fields.

Enforce authorization on the backend.

43. Sensitive Data

Sensitive fields should never be returned unnecessarily.

Examples:

password
passwordHash
JWT secrets
hiddenIdentifyingDetails
internal system information

Use Prisma select where necessary.

Public item responses should not automatically expose every database field.

44. Environment Configuration

Environment variables should include values such as:

NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
CLIENT_URL

Use .env locally.

Commit .env.example.

Never commit actual secrets.

45. Frontend Independence

The backend must not depend on frontend implementation details.

The backend should not contain logic specific to:

Next.js
React
Tailwind
shadcn/ui
TanStack Query
Redux

The backend only exposes a stable HTTP API.

Both frontend applications should consume the same API contracts.

46. API Contract Principles

Every API feature should define:

HTTP Method
Endpoint
Authentication Requirement
Authorization Requirement
Path Parameters
Query Parameters
Request Body
Response
Error Cases

This contract should remain stable unless a breaking change is intentionally introduced.

47. Breaking Changes

Avoid breaking existing API contracts unnecessarily.

When modifying an existing endpoint, consider:

Existing frontend usage

Response compatibility

Request compatibility

Database compatibility

If a breaking change is required, document it clearly.

Do not silently change response structures.

48. Feature Development Architecture

UniFind is developed feature by feature.

A typical backend development sequence is:

Project Setup
    ↓
Database Setup
    ↓
Authentication
    ↓
Users
    ↓
Categories
    ↓
Items
    ↓
Images
    ↓
Search / Filtering
    ↓
Claims
    ↓
Admin
    ↓
Testing / Hardening

This is a roadmap, not a requirement to implement everything immediately.

Only implement the current requested feature.

49. Feature Implementation Flow

For every feature:

Requirement
    ↓
Architecture Review
    ↓
Database Changes
    ↓
Validation
    ↓
Repository
    ↓
Service
    ↓
Controller
    ↓
Route
    ↓
Testing
    ↓
Review
    ↓
Commit

Not every feature requires every layer.

Do not create unnecessary files if a feature does not need them.

50. Avoid Overengineering

UniFind should not initially use:

Microservices
Kafka
RabbitMQ
Kubernetes
Elasticsearch
Redis
CQRS
Event Sourcing
Complex distributed systems

unless an actual requirement justifies them.

The preferred architecture is:

Modular Monolith
+
Express
+
PostgreSQL
+
Prisma

Keep the architecture appropriate for the size and purpose of the project.

51. Architectural Decision Making

When multiple approaches are possible, evaluate:

Simplicity

Correctness

Security

Maintainability

Development speed

Current scale

Realistic future requirements

Do not optimize for hypothetical scale.

Prefer the solution that solves the current problem cleanly.

52. Architecture Review Checklist

Before introducing a new architectural pattern, ask:

Does the current architecture fail to solve the problem?

Does this reduce complexity?

Does this improve maintainability?

Does this improve security?

Does this solve a measurable performance problem?

Will the team understand the new abstraction?

Can the same result be achieved more simply?

If the answer is mostly no, do not introduce the pattern.

53. Final Architecture Principle

The UniFind backend should remain:

Simple enough to understand.

Structured enough to maintain.

Secure enough to trust.

Flexible enough to evolve.

The architecture should support the product rather than become the product itself.