package clients

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type StreamingService struct {
	Name string `json:"name"`
	Link string `json:"link"`
}

func FetchStreamingOptions(tmdbID string) ([]StreamingService, error) {
	url := fmt.Sprintf(
		"https://streaming-availability.p.rapidapi.com/shows/movie/%s?country=us",
		tmdbID,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-rapidapi-key", os.Getenv("RAPIDAPI_KEY"))
	req.Header.Set("x-rapidapi-host", os.Getenv("RAPIDAPI_HOST"))

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(bodyBytes, &result)

	streamingOptions, ok := result["streamingOptions"].(map[string]interface{})
	if !ok {
		return nil, nil
	}

	usOptions, ok := streamingOptions["us"].([]interface{})
	if !ok {
		return nil, nil
	}

	var services []StreamingService
	seen := make(map[string]bool)
	for _, opt := range usOptions {
		o, ok := opt.(map[string]interface{})
		if !ok {
			continue
		}
		service, _ := o["service"].(map[string]interface{})
		name, _ := service["name"].(string)
		link, _ := o["link"].(string)
		if name != "" && !seen[name] {
			seen[name] = true
			services = append(services, StreamingService{Name: name, Link: link})
		}
	}
	return services, nil
}
