# unifind-backend

Express (v5, ESM) API server.

## Setup

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev    # watch mode
npm start      # production
```

## Structure

```
src/
├── app.js                 # express app: middleware + route mounting
├── server.js              # http listener + graceful shutdown
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
| GET    | `/api/health` | Health check |

## Adding a resource

1. `src/services/foo.service.js` — logic
2. `src/controllers/foo.controller.js` — wrap handlers in `asyncHandler`, throw `ApiError` for failures
3. `src/routes/foo.routes.js` — define the router
4. Mount it in `src/routes/index.js`

## Response shape

Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "error": { "message": "...", "stack": "..." } }` (stack omitted in production)
