package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/clients"
	"movie-recommender/store"
)

func Next(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username   string `json:"username"`
		HiddenIDs  []int  `json:"hiddenIds"`
		CurrentIDs []int  `json:"currentIds"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	user, exists := store.GetUser(body.Username)
	if !exists {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}

	// Build exclude list from current + hidden
	excludeIDs := make([]int, 0)
	excludeIDs = append(excludeIDs, body.HiddenIDs...)
	excludeIDs = append(excludeIDs, body.CurrentIDs...)

	// Get one new recommendation
	recs, err := clients.GetRecommendationsWithExclusions(user.Ratings, 1, excludeIDs)
	if err != nil || len(recs) == 0 {
		jsonError(w, "no replacement found", http.StatusInternalServerError)
		return
	}

	rec := recs[0]
	rec.IsNew = true

	jsonOK(w, map[string]interface{}{"recommendation": rec})
}
