package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() {
	var err error
	DB, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	createTables()
	log.Println("Database connected.")
}

func createTables() {
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			username TEXT PRIMARY KEY,
			character TEXT NOT NULL DEFAULT '',
			is_new BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS movie_catalog (
			movie_id INTEGER PRIMARY KEY,
			title TEXT NOT NULL,
			genres TEXT NOT NULL DEFAULT ''
		);

		CREATE TABLE IF NOT EXISTS ratings (
			username TEXT NOT NULL REFERENCES users(username),
			movie_id INTEGER NOT NULL,
			rating FLOAT NOT NULL,
			PRIMARY KEY (username, movie_id)
		);

		CREATE TABLE IF NOT EXISTS recommendations (
			username TEXT NOT NULL REFERENCES users(username),
			movie_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			genres TEXT NOT NULL,
			estimated_rating FLOAT NOT NULL,
			is_new BOOLEAN NOT NULL DEFAULT FALSE,
			position INTEGER NOT NULL DEFAULT 0,
			PRIMARY KEY (username, movie_id)
		);

		CREATE TABLE IF NOT EXISTS watchlist (
			username TEXT NOT NULL REFERENCES users(username),
			movie_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			genres TEXT NOT NULL,
			estimated_rating FLOAT NOT NULL,
			added_at TIMESTAMP DEFAULT NOW(),
			PRIMARY KEY (username, movie_id)
		);

		CREATE TABLE IF NOT EXISTS hidden (
			username TEXT NOT NULL REFERENCES users(username),
			movie_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			genres TEXT NOT NULL,
			estimated_rating FLOAT NOT NULL,
			PRIMARY KEY (username, movie_id)
		);
	`)
	if err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}
}

// --- Types ---

type User struct {
	Username        string             `json:"username"`
	Character       string             `json:"character"`
	IsNew           bool               `json:"isNew"`
	Ratings         map[string]float64 `json:"ratings"`
	Recommendations []Recommendation   `json:"recommendations"`
}

type Recommendation struct {
	MovieID         int     `json:"movieId"`
	Title           string  `json:"title"`
	Genres          string  `json:"genres"`
	EstimatedRating float64 `json:"estimatedRating"`
	IsNew           bool    `json:"isNew"`
}

type WatchlistItem struct {
	MovieID         int     `json:"movieId"`
	Title           string  `json:"title"`
	Genres          string  `json:"genres"`
	EstimatedRating float64 `json:"estimatedRating"`
}

type RatedMovie struct {
	MovieID int     `json:"movieId"`
	Title   string  `json:"title"`
	Genres  string  `json:"genres"`
	Rating  float64 `json:"rating"`
}

// --- Movie catalog ---

func UpsertMovieCatalog(movieID int, title, genres string) {
	_, err := DB.Exec(`
		INSERT INTO movie_catalog (movie_id, title, genres)
		VALUES ($1, $2, $3)
		ON CONFLICT (movie_id) DO UPDATE SET title = $2, genres = $3`,
		movieID, title, genres,
	)
	if err != nil {
		log.Printf("UpsertMovieCatalog error: %v", err)
	}
}

func GetMovieCatalogEntry(movieID int) (string, string, bool) {
	var title, genres string
	err := DB.QueryRow(
		`SELECT title, genres FROM movie_catalog WHERE movie_id = $1`, movieID,
	).Scan(&title, &genres)
	if err != nil {
		return "", "", false
	}
	return title, genres, true
}

// --- User operations ---

func GetUser(username string) (*User, bool) {
	user := &User{Username: username}
	err := DB.QueryRow(
		`SELECT character, is_new FROM users WHERE username = $1`, username,
	).Scan(&user.Character, &user.IsNew)
	if err == sql.ErrNoRows {
		return nil, false
	}
	if err != nil {
		log.Printf("GetUser error: %v", err)
		return nil, false
	}
	user.Ratings = GetRatings(username)
	user.Recommendations = GetRecommendations(username)
	return user, true
}

func CreateUser(username string) *User {
	_, err := DB.Exec(
		`INSERT INTO users (username, character, is_new) VALUES ($1, '', TRUE)
		 ON CONFLICT (username) DO NOTHING`, username,
	)
	if err != nil {
		log.Printf("CreateUser error: %v", err)
	}
	return &User{Username: username, IsNew: true, Ratings: make(map[string]float64)}
}

func UpdateUser(username, character string, isNew bool) {
	_, err := DB.Exec(
		`UPDATE users SET character = $1, is_new = $2 WHERE username = $3`,
		character, isNew, username,
	)
	if err != nil {
		log.Printf("UpdateUser error: %v", err)
	}
}

// --- Ratings ---

func GetRatings(username string) map[string]float64 {
	rows, err := DB.Query(
		`SELECT movie_id, rating FROM ratings WHERE username = $1`, username,
	)
	if err != nil {
		return make(map[string]float64)
	}
	defer rows.Close()
	ratings := make(map[string]float64)
	for rows.Next() {
		var movieID int
		var rating float64
		rows.Scan(&movieID, &rating)
		ratings[fmt.Sprintf("%d", movieID)] = rating
	}
	return ratings
}

func GetRatedMovies(username string) []RatedMovie {
	rows, err := DB.Query(`
		SELECT r.movie_id, COALESCE(c.title, ''), COALESCE(c.genres, ''), r.rating
		FROM ratings r
		LEFT JOIN movie_catalog c ON c.movie_id = r.movie_id
		WHERE r.username = $1
		ORDER BY r.rating DESC`,
		username,
	)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var movies []RatedMovie
	for rows.Next() {
		var m RatedMovie
		rows.Scan(&m.MovieID, &m.Title, &m.Genres, &m.Rating)
		movies = append(movies, m)
	}
	return movies
}

func SaveRatings(username string, ratings map[string]float64) {
	for movieIDStr, rating := range ratings {
		var movieID int
		fmt.Sscanf(movieIDStr, "%d", &movieID)
		_, err := DB.Exec(`
			INSERT INTO ratings (username, movie_id, rating)
			VALUES ($1, $2, $3)
			ON CONFLICT (username, movie_id) DO UPDATE SET rating = $3`,
			username, movieID, rating,
		)
		if err != nil {
			log.Printf("SaveRatings error: %v", err)
		}
	}
}

// --- Recommendations ---

func GetRecommendations(username string) []Recommendation {
	rows, err := DB.Query(`
		SELECT movie_id, title, genres, estimated_rating, is_new
		FROM recommendations WHERE username = $1
		ORDER BY position ASC`, username,
	)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var recs []Recommendation
	for rows.Next() {
		var r Recommendation
		rows.Scan(&r.MovieID, &r.Title, &r.Genres, &r.EstimatedRating, &r.IsNew)
		recs = append(recs, r)
	}
	return recs
}

func SaveRecommendations(username string, recs []Recommendation) {
	_, err := DB.Exec(`DELETE FROM recommendations WHERE username = $1`, username)
	if err != nil {
		log.Printf("SaveRecommendations delete error: %v", err)
		return
	}
	for i, r := range recs {
		_, err := DB.Exec(`
			INSERT INTO recommendations (username, movie_id, title, genres, estimated_rating, is_new, position)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			username, r.MovieID, r.Title, r.Genres, r.EstimatedRating, r.IsNew, i,
		)
		if err != nil {
			log.Printf("SaveRecommendations insert error: %v", err)
		}
		// Also upsert into catalog
		UpsertMovieCatalog(r.MovieID, r.Title, r.Genres)
	}
}

// --- Watchlist ---

func GetWatchlist(username string) []WatchlistItem {
	rows, err := DB.Query(`
		SELECT movie_id, title, genres, estimated_rating
		FROM watchlist WHERE username = $1
		ORDER BY added_at DESC`, username,
	)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var items []WatchlistItem
	for rows.Next() {
		var item WatchlistItem
		rows.Scan(&item.MovieID, &item.Title, &item.Genres, &item.EstimatedRating)
		items = append(items, item)
	}
	return items
}

func AddToWatchlist(username string, item WatchlistItem) {
	_, err := DB.Exec(`
		INSERT INTO watchlist (username, movie_id, title, genres, estimated_rating)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (username, movie_id) DO NOTHING`,
		username, item.MovieID, item.Title, item.Genres, item.EstimatedRating,
	)
	if err != nil {
		log.Printf("AddToWatchlist error: %v", err)
	}
	UpsertMovieCatalog(item.MovieID, item.Title, item.Genres)
}

func RemoveFromWatchlist(username string, movieID int) {
	_, err := DB.Exec(
		`DELETE FROM watchlist WHERE username = $1 AND movie_id = $2`, username, movieID,
	)
	if err != nil {
		log.Printf("RemoveFromWatchlist error: %v", err)
	}
}

// --- Hidden ---

func GetHidden(username string) []Recommendation {
	rows, err := DB.Query(`
		SELECT movie_id, title, genres, estimated_rating
		FROM hidden WHERE username = $1`, username,
	)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var items []Recommendation
	for rows.Next() {
		var r Recommendation
		rows.Scan(&r.MovieID, &r.Title, &r.Genres, &r.EstimatedRating)
		items = append(items, r)
	}
	return items
}

func AddToHidden(username string, rec Recommendation) {
	_, err := DB.Exec(`
		INSERT INTO hidden (username, movie_id, title, genres, estimated_rating)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (username, movie_id) DO NOTHING`,
		username, rec.MovieID, rec.Title, rec.Genres, rec.EstimatedRating,
	)
	if err != nil {
		log.Printf("AddToHidden error: %v", err)
	}
	UpsertMovieCatalog(rec.MovieID, rec.Title, rec.Genres)
}

func RemoveFromHidden(username string, movieID int) {
	_, err := DB.Exec(
		`DELETE FROM hidden WHERE username = $1 AND movie_id = $2`, username, movieID,
	)
	if err != nil {
		log.Printf("RemoveFromHidden error: %v", err)
	}
}
