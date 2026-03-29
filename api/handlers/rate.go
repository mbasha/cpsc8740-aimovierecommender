package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/clients"
	"movie-recommender/db"
	"movie-recommender/store"
)

func Rate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username  string             `json:"username"`
		Character string             `json:"character"`
		Ratings   map[string]float64 `json:"ratings"`
		MovieMeta []struct {
			MovieID int    `json:"movieId"`
			Title   string `json:"title"`
			Genres  string `json:"genres"`
		} `json:"movieMeta"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	user, exists := store.GetUser(body.Username)
	if !exists {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}

	// Upsert any movie metadata sent alongside ratings
	for _, meta := range body.MovieMeta {
		if meta.Title != "" {
			db.UpsertMovieCatalog(meta.MovieID, meta.Title, meta.Genres)
		}
	}

	for k, v := range body.Ratings {
		user.Ratings[k] = v
	}
	user.Character = body.Character

	// Build exclude list from hidden movies
	hiddenMovies := db.GetHidden(body.Username)
	excludeIDs := make([]int, 0)
	for _, h := range hiddenMovies {
		excludeIDs = append(excludeIDs, h.MovieID)
	}

	recs, err := clients.GetRecommendationsWithExclusions(user.Ratings, 10, excludeIDs)
	if err != nil {
		jsonError(w, "inference failed", http.StatusInternalServerError)
		return
	}

	// Determine which are genuinely new vs existing
	existingIDs := make(map[int]bool)
	for _, r := range user.Recommendations {
		existingIDs[r.MovieID] = true
	}
	for i := range recs {
		recs[i].IsNew = !existingIDs[recs[i].MovieID]
	}

	user.Recommendations = recs
	user.IsNew = false
	store.SetUser(user)

	jsonOK(w, map[string]interface{}{"recommendations": recs})
}
