package clients

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"movie-recommender/store"
)

type inferenceRequest struct {
	Ratings map[string]float64 `json:"ratings"`
	N       int                `json:"n"`
}

type inferenceResponse struct {
	Recommendations []store.Recommendation `json:"recommendations"`
}

func GetRecommendations(ratings map[string]float64, n int) ([]store.Recommendation, error) {
	url := os.Getenv("PYTHON_SERVICE_URL") + "/recommend"
	body, _ := json.Marshal(inferenceRequest{Ratings: ratings, N: n})

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result inferenceResponse
	json.NewDecoder(resp.Body).Decode(&result)
	return result.Recommendations, nil
}
