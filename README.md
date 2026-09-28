# GalaxyCare — One UI Support

A Samsung Galaxy device troubleshooting web app. Describe a symptom and get an
AI-generated, risk-rated care plan with one-tap "Fix for me" actions.

- **Frontend:** React (Create React App / craco), Tailwind, shadcn/ui
- **Backend:** FastAPI + MongoDB, AI diagnoses via the Emergent LLM key
- **Clean API layer:** the UI only imports `src/services/api.js` — never calls the backend directly

---

## Prerequisites

- **Node.js** 18+ and **Yarn**
- **Python** 3.11+
- **MongoDB** running locally (or a MongoDB Atlas connection string)

---

## 1. Backend

```bash
cd backend

# create & activate a virtualenv
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# install deps (emergentintegrations needs the extra index)
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# create your .env from the example and fill in values
cp .env.example .env
#   - set MONGO_URL / DB_NAME
#   - set EMERGENT_LLM_KEY  (or use your own OpenAI key and edit the model in server.py)

# run the API on port 8001
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API is now at `http://localhost:8001/api` (try `http://localhost:8001/api/` → `{"message":"GalaxyCare API online"}`).

> No LLM key? The backend still works — it falls back to a built-in deterministic
> care plan that always includes LOW / MEDIUM / HIGH steps.

---

## 2. Frontend

```bash
cd frontend

# install deps
yarn install

# create your .env from the example
cp .env.example .env
#   REACT_APP_API_BASE_URL=http://localhost:8001/api

# start the dev server on port 3000
yarn start
```

Open `http://localhost:3000`.

> Any time you change `.env`, **restart** the dev server — Create React App only
> reads env vars at startup.

---

## API contract

| Method | Route            | Purpose                                   |
|--------|------------------|-------------------------------------------|
| POST   | `/api/diagnose`  | Returns diagnosis + risk-rated steps      |
| POST   | `/api/fix`       | Applies a low-risk step                    |
| GET    | `/api/history`   | List saved care plans                      |
| POST   | `/api/history`   | Save a care plan                           |
| DELETE | `/api/history`   | Clear all saved care plans                 |

To point the frontend at a different backend, just change
`REACT_APP_API_BASE_URL` and restart.
