package clients

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
)

type StreamingService struct {
	Name string `json:"name"`
	Link string `json:"link"`
	Icon string `json:"icon"`
}

func FetchStreamingOptions(tmdbID string) ([]StreamingService, error) {
	return nil, nil
}

func FetchStreamingByTitle(title string) ([]StreamingService, error) {
	// Strip year from title e.g. "The Dark Knight (2008)" -> "The Dark Knight"
	cleanTitle := title
	if idx := strings.Index(title, " ("); idx != -1 {
		cleanTitle = title[:idx]
	}

	pythonURL := os.Getenv("PYTHON_SERVICE_URL")
	endpoint := fmt.Sprintf("%s/streaming?title=%s", pythonURL, url.QueryEscape(cleanTitle))

	resp, err := http.Get(endpoint)
	if err != nil {
		return []StreamingService{}, nil
	}
	defer resp.Body.Close()

	var result struct {
		Services []StreamingService `json:"services"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return []StreamingService{}, nil
	}

	if result.Services == nil {
		return []StreamingService{}, nil
	}
	return result.Services, nil
}
