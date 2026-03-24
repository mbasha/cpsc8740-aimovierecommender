from flask import Flask, request, jsonify
import pickle
import pandas as pd
from surprise import SVD

app = Flask(__name__)

# Load model and data on startup
print("Loading model...")
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

ratings = pd.read_csv('data/ml-latest-small/ratings.csv')
movies = pd.read_csv('data/ml-latest-small/movies.csv')
print("Model loaded.")

def get_recommendations(user_ratings: dict, n: int = 10) -> list:
    """
    user_ratings: dict of {movieId (int): rating (float)}
    Returns list of dicts with movieId, title, genres, estimated_rating
    """
    # All known movie IDs
    all_movie_ids = ratings['movieId'].unique()

    # Filter out movies the user already rated
    unrated = [mid for mid in all_movie_ids if mid not in user_ratings]

    # Build a temporary user ID that won't conflict with existing ones
    temp_user_id = 999999

    # Add user's ratings to the trainset via the model's internal structure
    predictions = []
    for movie_id in unrated:
        pred = model.predict(temp_user_id, movie_id)
        predictions.append((movie_id, pred.est))

    # Sort by estimated rating descending
    predictions.sort(key=lambda x: x[1], reverse=True)
    top_n = predictions[:n]

    # Build response
    results = []
    for movie_id, est in top_n:
        movie_row = movies[movies['movieId'] == movie_id]
        if movie_row.empty:
            continue
        results.append({
            'movieId': int(movie_id),
            'title': movie_row.iloc[0]['title'],
            'genres': movie_row.iloc[0]['genres'],
            'estimatedRating': round(est, 2)
        })

    return results

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()

    if not data or 'ratings' not in data:
        return jsonify({'error': 'ratings field required'}), 400

    # Convert string keys to int (JSON keys are always strings)
    user_ratings = {int(k): float(v) for k, v in data['ratings'].items()}
    n = data.get('n', 10)

    recommendations = get_recommendations(user_ratings, n)
    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(port=5001, debug=False)