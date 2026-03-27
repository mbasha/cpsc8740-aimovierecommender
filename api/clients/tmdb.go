package clients

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
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
	// Extract year from title if present e.g. "Captain Fantastic (2016)"
	year := ""
	if idx := strings.Index(title, " ("); idx != -1 {
		raw := title[idx+2:]
		raw = strings.TrimSuffix(raw, ")")
		raw = strings.TrimSpace(raw)
		if len(raw) == 4 {
			year = raw
		}
	}

	searchTitle := strings.Split(title, " (")[0]
	searchTitle = url.QueryEscape(searchTitle)

	queryURL := fmt.Sprintf(
		"https://api.themoviedb.org/3/search/movie?query=%s&language=en-US&page=1",
		searchTitle,
	)
	if year != "" {
		queryURL += "&year=" + year
	}

	req, err := http.NewRequest("GET", queryURL, nil)
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
