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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
