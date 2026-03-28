#!/bin/bash
# Reset all user data from the database
# Usage: ./scripts/reset_db.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Load .env
if [ -f "$ROOT/.env" ]; then
  export $(grep -v '^#' "$ROOT/.env" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi

echo "WARNING: This will delete ALL user data from the database."
echo "This includes all users, ratings, recommendations, watchlists, and hidden movies."
echo ""
read -p "Are you sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

psql "$DATABASE_URL" <<EOF
TRUNCATE TABLE hidden CASCADE;
TRUNCATE TABLE watchlist CASCADE;
TRUNCATE TABLE recommendations CASCADE;
TRUNCATE TABLE ratings CASCADE;
TRUNCATE TABLE users CASCADE;
EOF

echo "Database cleared successfully."