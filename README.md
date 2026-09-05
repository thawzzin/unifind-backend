# unifind-backend

Express (v5, ESM) API server written in TypeScript.

## Setup

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev    # watch mode
npm run build  # compile TypeScript to dist/
npm start      # run the compiled production server
```

## Structure

```
src/
├── app.ts                 # express app: middleware + route mounting
├── server.ts              # http listener + graceful shutdown
├── config/                # env-backed config
├── routes/                # url -> controller mapping
├── controllers/           # request/response handling
├── services/              # business logic
├── middlewares/           # notFound, errorHandler
└── utils/                 # ApiError, asyncHandler
```

## Endpoints

| Method | Path          | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/v1/health` | Health check |

## Adding a resource

1. `src/services/foo.service.ts` — logic
2. `src/controllers/foo.controller.ts` — wrap handlers in `asyncHandler`, throw `ApiError` for failures
3. `src/routes/foo.routes.ts` — define the router
4. Mount it in `src/routes/index.ts`

## Response shape

Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "error": { "message": "...", "stack": "..." } }` (stack omitted in production)
