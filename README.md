# CPSC 8740 - AI Movie Recommender

A personalized movie recommendation system built with machine learning. The system uses collaborative filtering trained on the MovieLens dataset to suggest films based on user preferences and behavior.

## Tech Stack

- **ML/Data**: Python 3.11, Jupyter Notebooks, scikit-surprise, pandas, numpy, matplotlib, seaborn
- **Backend**: Go 1.24 (net/http)
- **Frontend**: React (Vite)
- **Dataset**: [MovieLens ml-latest-small](https://grouplens.org/datasets/movielens/)

## Project Structure
```
cpsc8740-aimovierecommender/
  api/              # Go REST API
  frontend/         # React frontend (Vite)
  exploration.ipynb # Jupyter notebook for data exploration and model development
  data/             # MovieLens dataset (not tracked in git - download separately)
```

## Setup

### Python / ML Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install jupyter pandas numpy matplotlib seaborn scikit-surprise
jupyter notebook
```

### Go API
```bash
cd api
go run main.go
# Health check available at localhost:8080/health
```

### React Frontend
```bash
cd frontend
npm install
npm run dev
# Available at localhost:5173
```

### Dataset
Download [ml-latest-small](https://grouplens.org/datasets/movielens/) and unzip into:
```
data/ml-latest-small/
```

## Course
Clemson University — CPSC 8740