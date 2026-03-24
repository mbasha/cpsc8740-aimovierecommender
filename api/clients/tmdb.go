package clients

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type TMDBMovie struct {
	ID          float64 `json:"id"`
	Title       string  `json:"title"`
	Overview    string  `json:"overview"`
	ReleaseDate string  `json:"release_date"`
	VoteAverage float64 `json:"vote_average"`
	PosterPath  string  `json:"poster_path"`
}

func FetchTMDBMovie(title string) (*TMDBMovie, error) {
	searchTitle := strings.Split(title, " (")[0]
	searchTitle = strings.ReplaceAll(searchTitle, " ", "+")

	url := fmt.Sprintf(
		"https://api.themoviedb.org/3/search/movie?query=%s&language=en-US&page=1",
		searchTitle,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("TMDB_READ_ACCESS_TOKEN"))
	req.Header.Set("Accept", "application/json")

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Results []TMDBMovie `json:"results"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	if len(result.Results) == 0 {
		return nil, fmt.Errorf("no results for: %s", title)
	}

	return &result.Results[0], nil
}

func PosterURL(posterPath string) string {
	if posterPath == "" {
		return ""
	}
	return "https://image.tmdb.org/t/p/w500" + posterPath
}
