package handlers

import (
	"encoding/json"
	"net/http"

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
		store.Save()
	}

	jsonOK(w, user)
}
