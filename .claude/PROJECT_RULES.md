UniFind Backend — Project Rules

These rules apply to all development in the unifind-backend repository.

They exist to keep the backend simple, consistent, secure, maintainable, and compatible with the architecture defined in .claude/ARCHITECTURE.md.

1. Core Stack

Use the following stack unless explicitly instructed otherwise:

Node.js

Express.js

TypeScript

PostgreSQL

Prisma ORM

JWT

bcrypt

Supporting libraries may include:

dotenv

cors

helmet

morgan

express-validator

multer

Do not replace core technologies or introduce major dependencies without a clear reason.

2. TypeScript Rules

TypeScript is required throughout the backend.

Use .ts files for:

Application code

Configuration

Prisma seed scripts

Tests

Utilities

Backend scripts

General rules:

Enable strict TypeScript checking.

Avoid any.

Prefer unknown when a value is genuinely unknown, then narrow it safely.

Do not use type assertions only to silence compiler errors.

Prefer type inference for simple local variables.

Use explicit types at important boundaries.

Reuse Prisma-generated types where appropriate.

Do not duplicate database model types unnecessarily.

Keep Express-specific types at the HTTP layer.

Services and repositories should not depend on Express Request or Response.

TypeScript provides compile-time safety, but it does not validate runtime input.

All external input must still be validated.

3. Development Approach

UniFind must be developed feature by feature.

Each requested feature should be small enough to:

Understand

Implement

Verify

Review

Commit independently

Only implement the currently requested feature.

Do not automatically implement related future features.

Do not create placeholder implementations for future roadmap items.

After completing a feature:

Explain what changed.

Explain important implementation decisions.

Run relevant verification.

Suggest a Git commit message.

Stop and wait for the next instruction.

Do not create a Git commit unless explicitly asked.

4. Scope Discipline

Only modify files required for the current feature.

Avoid:

Unrelated refactoring

Unrequested schema changes

Unrequested API changes

New dependencies without justification

Premature abstractions

Future-feature placeholders

If an unfinished prerequisite genuinely blocks the requested feature, explain the dependency before proceeding.

For minor implementation details that do not materially affect the product or architecture, use a sensible default.

5. Architecture

Follow this request flow:

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

Responsibilities must remain clearly separated.

Do not bypass layers simply to make implementation faster unless there is a justified architectural reason.

6. Route Rules

Routes are responsible for:

HTTP methods

URL paths

Middleware composition

Controller mapping

Routes should contain minimal logic.

Do not:

Put business logic in routes.

Query Prisma from routes.

Perform complex data transformations in routes.

Example:

router.post(
  '/',
  authenticate,
  validate(createItemSchema),
  itemController.create
);

7. Controller Rules

Controllers are responsible for HTTP concerns.

Controllers should:

Read validated request data.

Read authenticated user information.

Call services.

Return HTTP responses.

Controllers should remain thin.

Do not:

Query Prisma directly.

Implement complex business rules.

Perform ownership decisions.

Coordinate multi-step database operations.

Pass Express Request or Response into services.

Example:

export const createItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const item = await itemService.create({
    userId: req.user.id,
    input: req.body
  });

  return res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: item
  });
};

8. Service Rules

Services contain application and business logic.

Services are responsible for:

Business rules

Ownership checks

Status transitions

Claim rules

Coordinating repositories

Transactions when required

Deciding whether an operation is allowed

Services should accept typed application data.

Do not use:

req
res
req.body
req.params
res.status()
res.json()

inside services.

Keep HTTP concerns outside the service layer.

9. Repository Rules

Repositories are responsible for database access.

Repositories should:

Use Prisma.

Encapsulate queries.

Return data needed by services.

Apply database-level filters.

Apply database-level pagination.

Use appropriate Prisma select and include.

Repositories should not:

Handle HTTP responses.

Access Express objects.

Decide user permissions.

Contain unrelated business rules.

Perform authentication.

Normal database flow:

Service
  ↓
Repository
  ↓
Prisma

10. Prisma Rules

Prisma is the primary database access layer.

Do not query PostgreSQL directly unless there is a documented technical reason.

Do not use Prisma directly from controllers or routes.

When changing the database schema:

Update prisma/schema.prisma.

Create a Prisma migration.

Review the migration.

Update affected application code.

Verify the migration and feature.

Do not manually change the production database while leaving the Prisma schema and migration history inconsistent.

Do not use prisma db push as a replacement for proper migrations in shared or production workflows.

11. Database Design Rules

Prefer normalized relational data.

Before adding a field, consider:

Is this field actually required?

Should it be nullable?

Is it derived from existing data?

Does it belong to another model?

Does it need an index?

Is it public or sensitive?

Is it specific to LOST or FOUND items?

Do not duplicate data without a clear reason.

Use explicit Prisma relations.

12. Database Query Rules

Let PostgreSQL perform operations it is designed for.

Use database-level:

Filtering

Sorting

Searching

Pagination

Do not load an entire table and filter it in Node.js.

Avoid:

N+1 queries

Unbounded collection queries

Fetching unnecessary relations

Selecting sensitive fields unnecessarily

Use Prisma select where it improves data safety or query efficiency.

13. Database Index Rules

Create indexes based on actual query patterns.

Potential candidates include fields commonly used for:

Foreign-key lookups

Filtering

Sorting

Unique lookup

Do not add indexes to every field.

Review indexes when implementing the queries that require them.

14. Transaction Rules

Use Prisma transactions when multiple database changes must succeed or fail together.

Examples may include:

Completing a return workflow

Updating a claim and related item atomically

Other operations where partial success would corrupt business state

Do not use transactions for simple single-query operations.

Keep transactions as short as practical.

15. User Roles

UniFind supports:

STUDENT
STAFF
ADMIN

Do not introduce additional roles unless required.

Public registration must never allow a user to assign themselves a privileged role such as ADMIN.

Do not trust a role supplied by the frontend.

Role changes must be controlled by authorized backend operations.

16. Authentication Rules

Protected endpoints use JWT authentication.

Authentication middleware should:

Read the bearer token.

Verify the token.

Reject invalid or expired tokens.

Establish the authenticated user's identity.

Make that identity available to downstream code.

Never trust a client-provided userId when the authenticated user's ID is already known.

For user-owned operations, derive the acting user from authentication.

17. Password Rules

Passwords must never be stored in plain text.

Use bcrypt for password hashing.

Never:

Return password hashes.

Log passwords.

Include passwords in JWT payloads.

Include password hashes in normal user responses.

Password validation rules should be enforced before hashing.

18. Authorization Rules

Authentication answers:

Who is this user?

Authorization answers:

Is this user allowed to perform this action?

Both must be enforced on the backend.

Frontend route guards and hidden buttons are not security controls.

Check:

Role permissions

Resource ownership

Resource state

Business rules

before performing protected operations.

19. Object Ownership Rules

For operations on user-owned resources:

Authenticate the user.

Retrieve the resource.

Verify ownership or elevated permission.

Verify the requested operation is allowed.

Perform the operation.

Do not assume that knowing a resource ID grants permission to modify it.

Prevent IDOR-style authorization issues.

20. Item Types

UniFind supports two item types:

LOST
FOUND

Use a shared Item model unless a future requirement provides a strong reason to split the models.

Business validation may differ based on item type.

21. Item Status Rules

Item statuses are intentionally simple.

LOST

Allowed statuses:

ACTIVE
RECOVERED

Default status:

ACTIVE

A LOST item must not use FOUND-item statuses.

FOUND

Allowed statuses:

AVAILABLE
RETURNED

Default status:

AVAILABLE

A FOUND item must not use LOST-item statuses.

Enforce these invariants in backend business logic.

Do not add statuses such as:

MATCHED
CLAIMED
PENDING
VERIFIED

to the Item lifecycle without a specific requirement.

22. Item Field Rules

Fields shared by lost and found reports may include:

title

description

category

location

itemDate

images

LOST-specific optional fields may include:

color

brand

reward

FOUND-specific optional fields may include:

storageLocation

hiddenIdentifyingDetails

Validation should enforce type-specific rules where necessary.

Do not blindly accept every Item field for both item types.

23. Claim Rules

Claims are separate resources from Items.

Claim statuses are:

PENDING
APPROVED
REJECTED

A pending claim does not change an Item status.

A FOUND item should generally remain:

AVAILABLE

while claims are being reviewed.

Claim approval and physical return are distinct concepts unless the product explicitly defines them as the same action.

An item should become:

RETURNED

when the return/handover is actually confirmed.

Important claim rules should include:

A claim must reference an eligible FOUND item.

The item must be AVAILABLE when a new claim is submitted.

A user must not claim their own found-item report.

Duplicate active claims from the same user for the same item should be prevented.

Claim review must be restricted to authorized users.

Claim state transitions must be validated.

Implement these rules when the claims feature is reached; do not build the claims module prematurely.

24. Sensitive Item Information

Fields intended for ownership verification are sensitive.

For example:

hiddenIdentifyingDetails

must not be exposed in normal public item endpoints.

Do not rely on the frontend to hide sensitive data.

Exclude sensitive fields from the backend response itself.

Only authorized flows should be able to access sensitive information.

25. Category Rules

Categories should be stored in the database.

Do not hardcode the authoritative category list into client applications.

Normal users may read categories where required.

Category creation, update, and deletion should be restricted to authorized administrators.

Avoid deleting a category in a way that breaks existing Item relations.

The exact deletion behavior should be defined when category management is implemented.

26. Validation Rules

All external input is untrusted.

Validate:

Request bodies

Query parameters

Route parameters

Headers where relevant

Uploaded files

TypeScript types do not provide runtime validation.

Validation should happen before business logic.

Validation errors should be clear and consistent.

Do not depend on Prisma/database errors as the normal way to validate user input.

27. Mass Assignment Rules

Do not pass an entire untrusted request body directly into Prisma.

Avoid patterns such as:

await prisma.user.update({
  where: { id },
  data: req.body
});

Explicitly define which fields an endpoint is allowed to modify.

This is especially important for fields such as:

role

userId

status

passwordHash

internal verification fields

28. API Naming Rules

Use RESTful, resource-oriented endpoint names.

Prefer:

GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

Avoid:

/api/getItems
/api/createItem
/api/updateItem
/api/deleteItem

Use plural resource names consistently.

29. HTTP Method Rules

Use HTTP methods according to their semantics.

GET     Read
POST    Create / non-idempotent operation
PATCH   Partial update
DELETE  Delete

Do not use POST for every operation.

30. HTTP Status Code Rules

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

Do not return 200 OK for application errors.

Use 401 when authentication is missing or invalid.

Use 403 when the authenticated user is not permitted to perform the operation.

31. API Response Rules

Keep API responses consistent.

Successful response:

{
  "success": true,
  "message": "Item created successfully",
  "data": {}
}

Error response:

{
  "success": false,
  "message": "Item not found",
  "data": null
}

For paginated collection endpoints, include pagination metadata consistently.

Do not silently change established response contracts.

32. Pagination Rules

Collection endpoints that can grow significantly should support pagination.

Recommended defaults:

page = 1
limit = 20

Always define a reasonable maximum limit.

Do not expose an unlimited collection endpoint by default.

Pagination calculations and queries should happen at the database level.

33. Search and Filter Rules

Search and filtering should be handled by the backend.

Item filters may include:

type

categoryId

status

location

itemDate/date range

keyword

Validate all query parameters.

Do not construct unsafe raw SQL from search input.

Use Prisma query APIs unless raw SQL is genuinely required.

34. Error Handling Rules

Use centralized error handling.

Expected application errors should have meaningful messages and appropriate HTTP status codes.

Unexpected errors should:

Be logged internally.

Return a safe generic response in production.

Never expose:

Stack traces

Database credentials

JWT secrets

Internal Prisma details

Environment variables

to clients.

35. Logging Rules

Logging should help diagnose application behavior without leaking sensitive data.

Do not log:

Plain-text passwords

Password hashes

JWT access tokens

JWT secrets

Sensitive ownership-verification information

Full sensitive request bodies

Production logging should avoid unnecessary personal data.

36. Environment Variable Rules

Secrets and environment-specific configuration belong in environment variables.

Examples:

NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
CLIENT_URL

Use .env for local development.

Maintain .env.example using safe placeholder values.

Never commit real secrets.

When introducing a required environment variable, update .env.example.

37. File Upload Rules

Uploaded files are untrusted.

Validate:

MIME type

File size

Number of files

Allowed file categories

Do not rely solely on file extensions.

Do not allow arbitrary executable files.

Do not store large image binaries directly in PostgreSQL.

Keep storage-specific logic separate from Item business logic.

38. CORS Rules

Only allow origins required by the application environment.

Typical consumers are:

unifind-client

unifind-admin-panel

Do not use an unrestricted production CORS configuration without a clear reason.

Environment-specific origins should come from configuration.

39. Security Middleware

Use security middleware where appropriate.

The baseline Express application should support:

Helmet

CORS

Request validation

Authentication

Authorization

Centralized error handling

Rate limiting may be added to abuse-sensitive endpoints such as authentication when that feature is implemented.

Do not add complex security infrastructure unrelated to the current feature.

40. Dependency Rules

Before adding a dependency, ask:

Is it actually needed?

Can the existing stack solve the problem?

Does another installed dependency already solve it?

Is the package maintained?

Does it introduce unnecessary complexity?

Avoid dependency bloat.

Do not replace an existing library simply because another library is more popular.

41. Naming Rules

Use descriptive names.

Prefer:

createItem
getItemById
updateItem
submitClaim
approveClaim
itemRepository
claimService

Avoid vague names such as:

handle
processData
doThing
executeStuff
manager
helper2

Use consistent naming conventions throughout the project.

42. Function Rules

Keep functions focused.

A function should have one clear responsibility.

Avoid large functions that simultaneously:

Validate HTTP input

Perform authorization

Query several tables

Apply business rules

Format responses

Send responses

Split responsibilities according to the architecture.

43. Utility Rules

Do not turn business logic into generic utilities.

Utilities should contain genuinely reusable technical functionality.

Business rules belong in services.

Avoid creating a large utils folder filled with unrelated application logic.

44. Type Definition Rules

Shared application types may live in:

src/types/

Create shared types only when multiple modules genuinely need them.

Examples may include:

Authenticated user context

Pagination input/output

Shared API-related types

Do not duplicate Prisma model types manually when Prisma already generates the required type.

Do not create a type abstraction for every small object.

45. Express Type Extensions

If authentication middleware attaches a user to the Express request, define that typing centrally.

Do not repeatedly cast:

req as any

throughout controllers.

Use a properly typed request or Express declaration merging where appropriate.

Keep the authenticated user shape minimal.

Example concept:

{
  id: string;
  role: Role;
}

Do not attach sensitive user records to every request unnecessarily.

46. Date and Time Rules

Store timestamps consistently.

Prefer database timestamps and ISO 8601 representations at API boundaries.

Be explicit about the distinction between:

createdAt

updatedAt

The date an item was lost or found

Do not confuse record creation time with itemDate.

47. Testing Rules

Tests should focus on behavior that matters.

Prioritize:

Authentication

Authorization

Ownership

Validation

Item lifecycle rules

Claim lifecycle rules

Sensitive data exposure

Important service logic

Do not write meaningless tests solely to increase coverage.

When fixing a meaningful bug, add a regression test when practical.

48. Verification Rules

Before declaring a feature complete, run the relevant project checks that actually exist in package.json.

These may include:

Type checking

Linting

Tests

Build

Prisma validation

Do not invent scripts that do not exist.

If verification cannot be completed, clearly state what was not verified and why.

49. Git Rules

Each feature should be independently commit-able.

Use focused commit suggestions such as:

feat(auth): add user registration
feat(auth): add login endpoint
feat(items): add item creation
feat(items): add item search and filters
feat(claims): add claim submission
fix(items): enforce item ownership

Avoid vague commit messages such as:

update backend
changes
finish project

Do not automatically commit changes unless explicitly requested.

50. Documentation Rules

When a feature changes an API contract, update the relevant documentation.

Document important:

Endpoint behavior

Authentication requirements

Authorization requirements

Request fields

Query parameters

Response shape

Business rules

Keep documentation synchronized with implementation.

51. No Premature Abstraction

Do not introduce abstractions solely because they might be useful later.

Avoid unnecessary patterns such as:

Generic base controllers

Universal repositories

Base services with little value

Complex dependency injection frameworks

Excessive interfaces with one implementation

Create abstractions when they solve an actual problem in the codebase.

52. No Overengineering

UniFind is initially a modular monolith.

Do not introduce the following without a demonstrated requirement:

Microservices

Kafka

RabbitMQ

Kubernetes

Redis

Elasticsearch

CQRS

Event sourcing

Complex distributed systems

The preferred architecture remains:

Express
+
TypeScript
+
Prisma
+
PostgreSQL

53. Frontend Independence

The backend is shared by both UniFind frontend applications.

Backend business logic must not depend on:

Next.js

React

Redux

TanStack Query

Tailwind CSS

shadcn/ui

The backend should expose stable HTTP contracts that any suitable client can consume.

54. Admin Rules

Administrative endpoints must be protected by backend authorization.

Do not rely on the admin frontend being hidden from students.

An authenticated STUDENT or STAFF user must not gain admin permissions by manually calling an admin endpoint.

Administrative operations should explicitly require the appropriate role.

55. Public Data Rules

Public/readable item endpoints should return only fields appropriate for their audience.

Do not simply serialize full Prisma records to the client.

Before returning data, consider:

Is this field sensitive?

Does the caller need it?

Could it help someone falsely claim an item?

Does it expose another user's private information?

Use explicit response shaping where appropriate.

56. Business Rule Location

Business rules must have a clear home.

Examples:

Can this user edit this item?
→ Item service

Can this claim be submitted?
→ Claim service

Can this status transition happen?
→ Relevant service

How is this record queried?
→ Repository

Is this HTTP body structurally valid?
→ Validator

Is this JWT valid?
→ Authentication middleware

Do not duplicate the same rule across controllers and routes.

57. Comments

Use comments for:

Non-obvious business decisions

Important security reasoning

Workarounds that require explanation

Do not comment obvious code.

Prefer clear code over excessive comments.

58. Before Completing a Feature

Review the current feature for:

Correct behavior

Type safety

Input validation

Authentication

Authorization

Ownership

Sensitive data exposure

Error handling

Database consistency

Migration correctness

Unnecessary complexity

Unrelated changes

Existing functionality regressions

Only then consider the feature complete.

59. Final Principle

The goal of UniFind backend development is not maximum architectural sophistication.

The goal is a backend that is:

Simple enough to understand.

Type-safe enough to evolve confidently.

Structured enough to maintain.

Secure enough to trust.

Focused enough to build incrementally.

When multiple solutions are valid, prefer the simplest solution that correctly satisfies the current requirement and follows the established architecture.