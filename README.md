# CPSC 8740 — Top Shelf Rentals (AI Movie Recommender)

A personalized movie recommendation system built for Clemson University CPSC 8740. Users pick a character "employee" at a fictional 90s video store, rate a curated list of films, and receive AI-generated recommendations based on their taste — with real-time streaming availability.

---

## Architecture

```
React Frontend (Vite)
        ↓
Go REST API  ──→  TMDB API (posters, metadata)
        ↓         JustWatch (streaming availability, via Python)
Python Inference Service
        ↓
SVD Collaborative Filtering Model (scikit-surprise)
MovieLens Dataset (~100k ratings)
        ↓
PostgreSQL (Render)
```

---

## Project Structure

```
cpsc8740-aimovierecommender/
  api/                      # Go REST API
    db/db.go                # PostgreSQL layer
    handlers/               # Route handlers
    clients/                # TMDB, JustWatch, inference clients
    main.go                 # Entry point, routing
    go.mod / go.sum
  frontend/                 # React/Vite app
    src/
      pages/                # Login, CharacterSelect, RatingFlow, Recommendations, Checkin
      components/           # MovieTile, MovieModal, MovieTileSkeleton, StarRating
      context/AppContext.jsx # Global state
    index.html
  scripts/
    start.sh                # Start all services locally
    build.sh                # Build for deployment
    reset_db.sh             # Wipe all user data from database
  data/
    ml-latest-small/        # MovieLens dataset (NOT in git — download separately)
  inference.py              # Python Flask inference + JustWatch streaming service
  model.pkl                 # Trained SVD model (NOT in git — generate via model.ipynb)
  exploration.ipynb         # Week 4 data exploration notebook
  model.ipynb               # Week 5 model training notebook
  requirements.txt          # Python dependencies for deployment
  runtime.txt               # Python version pin for Render (python-3.11.11)
  Makefile                  # Dev commands
  .env                      # Local environment variables (NOT in git — see template below)
  .env.example              # Template for .env
  frontend/.env.production  # Production API URL (NOT in git — see template below)
  frontend/.env.example     # Template for frontend env
```

---

## Prerequisites

- Python 3.11 (via Homebrew: `brew install python@3.11`)
- Go 1.21+
- Node.js 18+
- PostgreSQL database (local or Render free tier)
- TMDB account for API token (free): https://www.themoviedb.org/settings/api

---

## API Keys

This project requires one external API key:

| Key | Where to get it | Used for |
|-----|----------------|----------|
| `TMDB_READ_ACCESS_TOKEN` | https://www.themoviedb.org/settings/api — copy the long "API Read Access Token" (starts with `eyJ`) | Movie posters, metadata, community ratings |

JustWatch streaming data is fetched via the `simplejustwatchapi` Python library — no API key required.

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/mbasha/cpsc8740-aimovierecommender.git
cd cpsc8740-aimovierecommender
```

### 2. Create environment files

Copy the templates and fill in your values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Edit `.env`:
```
DATABASE_URL=your_postgres_connection_string
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
PYTHON_SERVICE_URL=http://localhost:5001
PORT=8080
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:8080
```

### 3. Set up Python environment

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Download the MovieLens dataset

Go to https://grouplens.org/datasets/movielens/ and download **ml-latest-small**. Unzip into:
```
data/ml-latest-small/
```

### 5. Generate the model

The trained model file (`model.pkl`) is not stored in the repo. Generate it by running all cells in:
```
model.ipynb
```

This takes a few minutes. The file will be saved to the project root.

### 6. Set up Go dependencies

```bash
cd api && go mod tidy && cd ..
```

### 7. Set up frontend dependencies

```bash
cd frontend && npm install && cd ..
```

### 8. Start all services

```bash
make start
```

This starts:
- Python inference service on `localhost:5001`
- Go API on `localhost:8080`
- React frontend on `localhost:5173`

Open `http://localhost:5173` in your browser.

---

## Makefile Commands

```
make start      Start all services locally
make build-api  Build the Go API binary
make install    Install all dependencies
make reset-db   Wipe all user data from the database
```

---

## Deployment (Render)

Two services are deployed on Render:

**Python Inference Service**
- Build: `pip install -r requirements.txt`
- Start: `python inference.py`
- Environment: `PORT=5001`
- Python version: set by `runtime.txt` (3.11.11)

**Go API + React Frontend**
- Build: `bash scripts/build.sh`
- Start: `./api/server`
- Environment variables:
  - `DATABASE_URL` — Render internal Postgres URL
  - `TMDB_READ_ACCESS_TOKEN` — your TMDB token
  - `PYTHON_SERVICE_URL` — internal URL of the Python service on Render
  - `PORT=8080`

Before deploying, update `frontend/.env.production` with the Go service URL:
```
VITE_API_URL=https://your-go-service.onrender.com
```

---

## Database

PostgreSQL hosted on Render (free tier). Tables are created automatically on first startup:
- `users` — usernames, character selection
- `ratings` — user movie ratings
- `recommendations` — current recommendation list per user
- `watchlist` — saved movies
- `hidden` — hidden movies
- `movie_catalog` — movie ID to title/genre lookup

To wipe all user data (e.g. after testing):
```bash
make reset-db
```