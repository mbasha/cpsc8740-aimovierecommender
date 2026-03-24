package handlers

import (
	"fmt"
	"net/http"

	"movie-recommender/clients"
)

func MovieDetail(w http.ResponseWriter, r *http.Request) {
	title := r.URL.Query().Get("title")
	if title == "" {
		jsonError(w, "title required", http.StatusBadRequest)
		return
	}

	movie, err := clients.FetchTMDBMovie(title)
	if err != nil {
		jsonError(w, "movie not found", http.StatusNotFound)
		return
	}

	tmdbID := fmt.Sprintf("%.0f", movie.ID)
	streaming, _ := clients.FetchStreamingOptions(tmdbID)

	jsonOK(w, map[string]interface{}{
		"tmdbId":      tmdbID,
		"title":       movie.Title,
		"overview":    movie.Overview,
		"releaseDate": movie.ReleaseDate,
		"rating":      movie.VoteAverage,
		"posterUrl":   clients.PosterURL(movie.PosterPath),
		"streaming":   streaming,
	})
}
