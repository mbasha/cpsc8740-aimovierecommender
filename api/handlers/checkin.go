package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/clients"
	"movie-recommender/store"
)

func Checkin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string             `json:"username"`
		Watched  map[string]float64 `json:"watched"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	user, exists := store.GetUser(body.Username)
	if !exists {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}

	for movieID, rating := range body.Watched {
		user.Ratings[movieID] = rating
	}

	newRecs, err := clients.GetRecommendations(user.Ratings, 10)
	if err != nil {
		jsonError(w, "inference failed", http.StatusInternalServerError)
		return
	}

	oldIDs := make(map[int]bool)
	for _, rec := range user.Recommendations {
		oldIDs[rec.MovieID] = true
	}
	for i := range newRecs {
		newRecs[i].IsNew = !oldIDs[newRecs[i].MovieID]
	}

	user.Recommendations = newRecs
	store.SetUser(user)
	store.Save()

	jsonOK(w, map[string]interface{}{"recommendations": newRecs})
}
