package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/db"
	"movie-recommender/store"
)

func WatchlistAdd(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string              `json:"username"`
		Movie    store.WatchlistItem `json:"movie"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Username == "" {
		jsonError(w, "username required", http.StatusBadRequest)
		return
	}

	db.AddToWatchlist(body.Username, body.Movie)
	jsonOK(w, map[string]string{"status": "ok"})
}

func WatchlistRemove(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		MovieID  int    `json:"movieId"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	db.RemoveFromWatchlist(body.Username, body.MovieID)
	jsonOK(w, map[string]string{"status": "ok"})
}

func WatchlistGet(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		jsonError(w, "username required", http.StatusBadRequest)
		return
	}

	items := db.GetWatchlist(username)
	if items == nil {
		items = []store.WatchlistItem{}
	}
	jsonOK(w, map[string]interface{}{"watchlist": items})
}
