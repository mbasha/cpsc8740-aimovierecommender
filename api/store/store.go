package store

import "movie-recommender/db"

type User = db.User
type Recommendation = db.Recommendation
type WatchlistItem = db.WatchlistItem

func Init() {
	db.Init()
}

func GetUser(username string) (*User, bool) {
	return db.GetUser(username)
}

func NewUser(username string) *User {
	return db.CreateUser(username)
}

func SetUser(user *User) {
	db.UpdateUser(user.Username, user.Character, user.IsNew)
	db.SaveRatings(user.Username, user.Ratings)
	if user.Recommendations != nil {
		db.SaveRecommendations(user.Username, user.Recommendations)
	}
}

func Save() {
	// No-op — Postgres writes are immediate
}
