package main

import (
	"log"
	"net/http"
	"os"

	"movie-recommender/handlers"
	"movie-recommender/middleware"
	"movie-recommender/store"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../.env")

	store.Init()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", middleware.WithCORS(handlers.Health))
	mux.HandleFunc("/api/login", middleware.WithCORS(handlers.Login))
	mux.HandleFunc("/api/rate", middleware.WithCORS(handlers.Rate))
	mux.HandleFunc("/api/checkin", middleware.WithCORS(handlers.Checkin))
	mux.HandleFunc("/api/movie", middleware.WithCORS(handlers.MovieDetail))
	mux.HandleFunc("/api/next", middleware.WithCORS(handlers.Next))
	mux.HandleFunc("/api/watchlist/add", middleware.WithCORS(handlers.WatchlistAdd))
	mux.HandleFunc("/api/watchlist/remove", middleware.WithCORS(handlers.WatchlistRemove))
	mux.HandleFunc("/api/watchlist", middleware.WithCORS(handlers.WatchlistGet))
	mux.HandleFunc("/api/hidden/add", middleware.WithCORS(handlers.HiddenAdd))
	mux.HandleFunc("/api/hidden/remove", middleware.WithCORS(handlers.HiddenRemove))
	mux.HandleFunc("/api/hidden", middleware.WithCORS(handlers.HiddenGet))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Serve React frontend — handle client-side routing. API routes are handled above, this catches everything else
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		distPath := "./dist"
		filePath := distPath + r.URL.Path

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			// Serve index.html for client-side routing
			http.ServeFile(w, r, distPath+"/index.html")
			return
		}
		http.FileServer(http.Dir(distPath)).ServeHTTP(w, r)
	})

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
