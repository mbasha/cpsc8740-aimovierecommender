package clients

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"movie-recommender/store"
)

type inferenceRequest struct {
	Ratings    map[string]float64 `json:"ratings"`
	N          int                `json:"n"`
	ExcludeIDs []int              `json:"exclude_ids"`
}

type inferenceResponse struct {
	Recommendations []store.Recommendation `json:"recommendations"`
}

func GetRecommendations(ratings map[string]float64, n int) ([]store.Recommendation, error) {
	return GetRecommendationsWithExclusions(ratings, n, nil)
}

func GetRecommendationsWithExclusions(ratings map[string]float64, n int, excludeIDs []int) ([]store.Recommendation, error) {
	url := os.Getenv("PYTHON_SERVICE_URL") + "/recommend"

	body, _ := json.Marshal(inferenceRequest{
		Ratings:    ratings,
		N:          n,
		ExcludeIDs: excludeIDs,
	})

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Error calling inference service at %s: %v", url, err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Inference service returned status %d: %s", resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("inference service returned status %d", resp.StatusCode)
	}

	var result inferenceResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Error decoding inference response: %v", err)
		return nil, err
	}
	return result.Recommendations, nil
}
