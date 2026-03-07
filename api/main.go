package main

import (
    "fmt"
    "log"
    "net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "OK")
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", healthHandler)

    log.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
