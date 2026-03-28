#!/bin/bash
# Reset all user data from the database
# Usage: make reset-db

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

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

source "$ROOT/venv/bin/activate"

python3 - <<EOF
import os
import psycopg2

url = os.environ['DATABASE_URL']
conn = psycopg2.connect(url)
cur = conn.cursor()

cur.execute("TRUNCATE TABLE hidden CASCADE;")
cur.execute("TRUNCATE TABLE watchlist CASCADE;")
cur.execute("TRUNCATE TABLE recommendations CASCADE;")
cur.execute("TRUNCATE TABLE ratings CASCADE;")
cur.execute("TRUNCATE TABLE users CASCADE;")

conn.commit()
cur.close()
conn.close()
print("Database cleared successfully.")
EOF