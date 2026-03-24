package store

import (
	"encoding/json"
	"os"
	"sync"
)

type User struct {
	Username        string             `json:"username"`
	Character       string             `json:"character"`
	Ratings         map[string]float64 `json:"ratings"`
	Recommendations []Recommendation   `json:"recommendations"`
	IsNew           bool               `json:"isNew"`
}

type Recommendation struct {
	MovieID         int     `json:"movieId"`
	Title           string  `json:"title"`
	Genres          string  `json:"genres"`
	EstimatedRating float64 `json:"estimatedRating"`
	IsNew           bool    `json:"isNew"`
}

type userStore struct {
	mu    sync.Mutex
	Users map[string]*User `json:"users"`
}

var store *userStore
var storeFile = "users.json"

func Init() {
	store = &userStore{Users: make(map[string]*User)}
	data, err := os.ReadFile(storeFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, store)
}

func Save() {
	store.mu.Lock()
	defer store.mu.Unlock()
	data, _ := json.MarshalIndent(store, "", "  ")
	os.WriteFile(storeFile, data, 0644)
}

func GetUser(username string) (*User, bool) {
	store.mu.Lock()
	defer store.mu.Unlock()
	user, exists := store.Users[username]
	return user, exists
}

func SetUser(user *User) {
	store.mu.Lock()
	defer store.mu.Unlock()
	store.Users[user.Username] = user
}

func NewUser(username string) *User {
	user := &User{
		Username: username,
		Ratings:  make(map[string]float64),
		IsNew:    true,
	}
	store.mu.Lock()
	defer store.mu.Unlock()
	store.Users[username] = user
	return user
}
