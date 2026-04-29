# Troubleshooting Guide

## Common Issues and Solutions

### 1. Login/Registration Not Working

**Symptoms:** Getting error messages when trying to create account or login

**Solutions:**

1. **Check if backend is running:**
```bash
docker-compose ps
```
All services should show "Up" status.

2. **Check backend logs:**
```bash
docker-compose logs backend
```
Look for:
- "Database connected successfully" - confirms DB connection
- "Server running on port 3001" - confirms server started
- Any error messages

3. **Check if migrations ran:**
```bash
docker-compose logs backend | grep migration
```
Should see "Tables already exist" or "running migrations"

4. **Manually run migrations if needed:**
```bash
docker-compose exec backend npm run migrate
```

5. **Check if you can reach the backend:**
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 2. Frontend Can't Connect to Backend

**Symptoms:** Network errors, CORS errors in browser console

**Solutions:**

1. **Check VITE_API_URL environment variable:**
   - Should be `http://localhost:3001` when running in Docker

2. **Check browser console:**
   - Press F12 in browser
   - Look for red error messages
   - Check Network tab for failed requests

3. **Verify backend is accessible:**
   - Open http://localhost:3001/health in browser
   - Should see JSON response

### 3. Database Connection Issues

**Symptoms:** Backend logs show "Error acquiring client" or connection errors

**Solutions:**

1. **Check if PostgreSQL is running:**
```bash
docker-compose ps postgres
```

2. **Check PostgreSQL logs:**
```bash
docker-compose logs postgres
```

3. **Restart PostgreSQL:**
```bash
docker-compose restart postgres
```

4. **Reset database (WARNING: deletes all data):**
```bash
docker-compose down -v
docker-compose up --build
```

### 4. Port Already in Use

**Symptoms:** Error like "port 5432/3001/5173 is already allocated"

**Solutions:**

1. **Check what's using the port:**
```bash
# For Linux/Mac
lsof -i :5432
lsof -i :3001
lsof -i :5173

# For Windows
netstat -ano | findstr :5432
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

2. **Stop the conflicting service or change ports in docker-compose.yml:**
```yaml
ports:
  - "5433:5432"  # Change 5432 to 5433
  - "3002:3001"  # Change 3001 to 3002
  - "5174:5173"  # Change 5173 to 5174
```

### 5. Docker Build Fails

**Symptoms:** Build errors during `docker-compose up --build`

**Solutions:**

1. **Clear Docker cache:**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

2. **Check Docker daemon is running:**
```bash
docker ps
```

3. **Make sure you have enough disk space:**
```bash
df -h
```

### 6. Hot Reload Not Working

**Symptoms:** Changes to code don't reflect in browser

**Solutions:**

1. **For frontend changes:**
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Check frontend logs: `docker-compose logs frontend`

2. **For backend changes:**
   - Backend should auto-restart with tsx watch
   - Check logs: `docker-compose logs backend`
   - If not working, restart: `docker-compose restart backend`

### 7. Cannot Create Transactions

**Symptoms:** Error when adding/editing/deleting transactions

**Solutions:**

1. **Check authentication:**
   - Make sure you're logged in
   - Check browser localStorage for token: `localStorage.getItem('token')`

2. **Check backend logs:**
```bash
docker-compose logs backend --tail=50
```

3. **Verify categories exist:**
```bash
docker-compose exec backend npm run migrate
```

### 8. Theme Not Switching

**Symptoms:** Light/dark mode button not working

**Solutions:**

1. **Clear browser cache and localStorage:**
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

2. **Check browser console for errors**

### 9. Complete Reset (Nuclear Option)

If nothing else works, completely reset everything:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker images
docker rmi $(docker images -q finance-tracker*)

# Remove node_modules (optional)
rm -rf backend/node_modules frontend/node_modules

# Rebuild everything from scratch
docker-compose up --build
```

## Getting More Help

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Enter Running Container
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d finance_tracker
```

### Check Database Tables
```bash
docker-compose exec postgres psql -U postgres -d finance_tracker -c "\dt"
```

### Check Database Data
```bash
# List all users
docker-compose exec postgres psql -U postgres -d finance_tracker -c "SELECT * FROM users;"

# List all transactions
docker-compose exec postgres psql -U postgres -d finance_tracker -c "SELECT * FROM transactions;"

# List all categories
docker-compose exec postgres psql -U postgres -d finance_tracker -c "SELECT * FROM categories;"
```

## Still Having Issues?

1. Check the main README.md for setup instructions
2. Make sure Docker and Docker Compose are up to date
3. Try the complete reset steps above
4. Check GitHub issues for similar problems
