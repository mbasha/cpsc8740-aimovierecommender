package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/clients"
	"movie-recommender/store"
)

func Rate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username  string             `json:"username"`
		Character string             `json:"character"`
		Ratings   map[string]float64 `json:"ratings"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	user, exists := store.GetUser(body.Username)
	if !exists {
		jsonError(w, "user not found", http.StatusNotFound)
		return
	}

	for k, v := range body.Ratings {
		user.Ratings[k] = v
	}
	user.Character = body.Character

	recs, err := clients.GetRecommendations(user.Ratings, 10)
	if err != nil {
		jsonError(w, "inference failed", http.StatusInternalServerError)
		return
	}

	for i := range recs {
		recs[i].IsNew = true
	}

	user.Recommendations = recs
	user.IsNew = false
	store.SetUser(user)
	store.Save()

	jsonOK(w, map[string]interface{}{"recommendations": recs})
}
