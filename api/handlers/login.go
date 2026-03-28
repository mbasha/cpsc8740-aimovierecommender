package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/db"
	"movie-recommender/store"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Username == "" {
		jsonError(w, "username required", http.StatusBadRequest)
		return
	}

	user, exists := store.GetUser(body.Username)
	if !exists {
		user = store.NewUser(body.Username)
	}

	watchlist := db.GetWatchlist(body.Username)
	if watchlist == nil {
		watchlist = []store.WatchlistItem{}
	}

	hidden := db.GetHidden(body.Username)
	if hidden == nil {
		hidden = []store.Recommendation{}
	}

	// Build set of hidden movie IDs
	hiddenSet := make(map[int]bool)
	for _, h := range hidden {
		hiddenSet[h.MovieID] = true
	}

	// Filter hidden movies out of recommendations
	filteredRecs := []store.Recommendation{}
	for _, rec := range user.Recommendations {
		if !hiddenSet[rec.MovieID] {
			filteredRecs = append(filteredRecs, rec)
		}
	}

	jsonOK(w, map[string]interface{}{
		"username":        user.Username,
		"character":       user.Character,
		"isNew":           user.IsNew,
		"ratings":         user.Ratings,
		"recommendations": filteredRecs,
		"watchlist":       watchlist,
		"hidden":          hidden,
	})
}
