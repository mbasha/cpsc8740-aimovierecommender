package handlers

import (
	"encoding/json"
	"net/http"

	"movie-recommender/db"
	"movie-recommender/store"
)

func HiddenAdd(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string               `json:"username"`
		Movie    store.Recommendation `json:"movie"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Username == "" {
		jsonError(w, "username required", http.StatusBadRequest)
		return
	}

	db.AddToHidden(body.Username, body.Movie)
	jsonOK(w, map[string]string{"status": "ok"})
}

func HiddenRemove(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		MovieID  int    `json:"movieId"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	db.RemoveFromHidden(body.Username, body.MovieID)
	jsonOK(w, map[string]string{"status": "ok"})
}

func HiddenGet(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		jsonError(w, "username required", http.StatusBadRequest)
		return
	}

	items := db.GetHidden(username)
	if items == nil {
		items = []store.Recommendation{}
	}
	jsonOK(w, map[string]interface{}{"hidden": items})
}
