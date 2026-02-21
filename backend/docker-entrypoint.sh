#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "postgres" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - checking if database exists..."

# Check if database exists, if not create it
DB_EXISTS=$(PGPASSWORD=postgres psql -h postgres -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='finance_tracker'")

if [ -z "$DB_EXISTS" ]; then
  echo "Database doesn't exist - creating it..."
  PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE finance_tracker;"
else
  echo "Database already exists"
fi

echo "Checking if tables exist..."

# Check if tables exist, if not run migration
TABLE_EXISTS=$(PGPASSWORD=postgres psql -h postgres -U postgres -d finance_tracker -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Tables don't exist - running migrations..."
  npm run migrate
else
  echo "Tables already exist - skipping migration"
fi

echo "Starting application..."
exec npm run dev
