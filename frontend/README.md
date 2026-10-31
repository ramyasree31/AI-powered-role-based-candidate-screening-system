# Screenwise frontend

React + Vite candidate interview flow. The frontend calls FastAPI for available
roles, PDF upload/session creation, session recovery, answer storage, completion,
and report retrieval.

## Run locally

Start FastAPI from the repository root:

```powershell
Push-Location backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Pop-Location
```

In another terminal:

```powershell
Push-Location frontend
npm install
npm run dev
Pop-Location
```

The Vite development server proxies `/api` and `/health` to
`http://127.0.0.1:8000`. Set `VITE_API_PROXY_TARGET` to use another backend
address. `VITE_API_BASE_URL` can be set when the frontend should call an API
origin directly; leave it empty to use the same-origin proxy.

For Docker, Nginx proxies `/api` and `/health` to the `backend` service.

## Current backend coverage

Implemented API routes:

- `GET /health`
- `GET /api/roles`
- `POST /api/sessions` (multipart `file` and `role`)
- `GET /api/sessions/{id}`
- `POST /api/sessions/{id}/answers`
- `POST /api/sessions/{id}/complete`
- `GET /api/sessions/{id}/report`

The uploaded PDF is validated but not retained. Sessions store the PDF filename
and size, selected role, and submitted answers in SQLite. Resume analysis,
personalized question generation, answer evaluation, and RAG retrieval are not
implemented; the interview UI labels its sample questions and does not show
mock scores or AI feedback.
