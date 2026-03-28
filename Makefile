.PHONY: start reset-db build-api install help

help:
	@echo "Top Shelf Rentals — Available commands:"
	@echo ""
	@echo "  make start       Start all services (inference, API, frontend)"
	@echo "  make build-api   Build the Go API"
	@echo "  make install     Install all dependencies"
	@echo "  make reset-db    Clear all user data from the database"
	@echo ""

start:
	@chmod +x scripts/start.sh
	@./scripts/start.sh

reset-db:
	@chmod +x scripts/reset_db.sh
	@./scripts/reset_db.sh

build-api:
	cd api && go build ./...

install:
	@echo "Installing Python dependencies..."
	pip install jupyter pandas numpy matplotlib seaborn scikit-surprise flask psycopg2-binary
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing Go dependencies..."
	cd api && go mod tidy
	@echo "Done."