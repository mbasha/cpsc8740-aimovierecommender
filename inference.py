from flask import Flask, request, jsonify
import pickle
import pandas as pd
from surprise import SVD, Dataset, Reader
from surprise import accuracy
from collections import defaultdict

app = Flask(__name__)

print("Loading model and data...")
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

ratings_df = pd.read_csv('data/ml-latest-small/ratings.csv')
movies_df = pd.read_csv('data/ml-latest-small/movies.csv')
print("Ready.")

def get_recommendations(user_ratings: dict, n: int = 10, exclude_ids: list = None) -> list:
    """
    user_ratings: {movieId (int): rating (float)}
    exclude_ids: list of movieIds to exclude from results
    Returns list of recommendation dicts
    """
    exclude_ids = set(exclude_ids or [])
    exclude_ids.update(user_ratings.keys())

    # Build a new dataset that includes the user's ratings
    # We add the user's ratings to the existing ratings dataframe
    temp_user_id = int(ratings_df['userId'].max()) + 1

    new_rows = pd.DataFrame([{
        'userId': temp_user_id,
        'movieId': int(movie_id),
        'rating': float(rating)
    } for movie_id, rating in user_ratings.items()])

    combined = pd.concat([ratings_df, new_rows], ignore_index=True)

    reader = Reader(rating_scale=(0.5, 5.0))
    data = Dataset.load_from_df(combined[['userId', 'movieId', 'rating']], reader)
    trainset = data.build_full_trainset()

    # Retrain model with user's ratings included
    personal_model = SVD(
        n_factors=150,
        n_epochs=30,
        lr_all=0.01,
        reg_all=0.1,
        random_state=42
    )
    personal_model.fit(trainset)

    # Get all movie IDs not in exclude list
    all_movie_ids = ratings_df['movieId'].unique()
    candidate_ids = [mid for mid in all_movie_ids if mid not in exclude_ids]

    # Predict ratings for all candidates
    predictions = []
    for movie_id in candidate_ids:
        pred = personal_model.predict(temp_user_id, movie_id)
        predictions.append((movie_id, pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_n = predictions[:n]

    results = []
    for movie_id, est in top_n:
        row = movies_df[movies_df['movieId'] == movie_id]
        if row.empty:
            continue
        results.append({
            'movieId': int(movie_id),
            'title': row.iloc[0]['title'],
            'genres': row.iloc[0]['genres'],
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

    user_ratings = {int(k): float(v) for k, v in data['ratings'].items()}
    n = data.get('n', 10)
    exclude_ids = [int(x) for x in (data.get('exclude_ids') or [])]

    recommendations = get_recommendations(user_ratings, n, exclude_ids)
    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(port=5001, debug=False)