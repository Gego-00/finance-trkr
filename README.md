# Finance Tracker SaaS

A full-stack financial management application built with TypeScript, featuring comprehensive income and expense tracking with beautiful visualizations.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Income & Expense Tracking**: Add, edit, and delete financial transactions
- **Analytics Dashboard**: Visual representations of your financial data
  - Pie charts for expense breakdown by category
  - Bar charts comparing income vs expenses
  - Summary cards showing totals and balance
- **Category Management**: Pre-configured categories with customizable colors
- **Light/Dark Mode**: Full theme support using shadcn/ui
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant data refresh after operations

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible UI components
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for validation

### DevOps
- **Docker & Docker Compose** for containerization
- Complete environment isolation
- Easy deployment and scalability

### Testing
- **Jest** for backend unit and integration tests
- **Vitest** with React Testing Library for frontend tests
- **80%+ code coverage** for both frontend and backend
- Comprehensive test suite with mocking and fixtures

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)
- PostgreSQL 15+ (for local development without Docker)

### Quick Start with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-tracker
```

2. Start all services (includes automatic migration):
```bash
chmod +x start.sh
./start.sh
```

**OR manually:**

```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432

**Note:** Database migrations run automatically on first startup. The backend waits for PostgreSQL to be ready before starting.

### Local Development Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_tracker
JWT_SECRET=your-secure-secret-key
PORT=3001
NODE_ENV=development
```

5. Run migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration and migrations
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Main server file
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── ...        # Custom components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Global styles
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get all transactions (with optional filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/analytics` - Get analytics data

### Categories
- `GET /api/categories` - Get all categories for user

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `full_name` - User's full name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Transactions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `category_id` - Foreign key to categories
- `type` - 'income' or 'expense'
- `amount` - Transaction amount
- `description` - Optional description
- `date` - Transaction date
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Categories Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Category name
- `type` - 'income' or 'expense'
- `color` - Hex color code
- `created_at` - Timestamp

## Features in Detail

### Dashboard
The main dashboard provides:
- Summary cards showing total income, expenses, and balance
- Pie chart visualization of expenses by category
- Bar chart comparing income vs expenses
- Searchable and sortable transaction table
- Quick actions to add, edit, or delete transactions

### Transaction Management
- Add new transactions with category, amount, description, and date
- Edit existing transactions
- Delete transactions with confirmation
- Automatic categorization with color coding
- Real-time balance calculations

### Theme Support
- Light and dark modes
- System theme detection
- Persistent theme preference
- Smooth transitions between themes

### Security
- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Secure token storage
- SQL injection prevention with parameterized queries

## Production Deployment

### Environment Variables

Update the following for production:

**Backend:**
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-very-secure-secret-key-change-this
NODE_ENV=production
PORT=3001
```

**Frontend:**
```
VITE_API_URL=https://your-api-domain.com
```

### Docker Compose Production

1. Update `docker-compose.yml` environment variables
2. Build and start services:
```bash
docker-compose up -d --build
```

3. Run migrations:
```bash
docker-compose exec backend npm run migrate
```

### Nginx Reverse Proxy (Optional)

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Development

### Running Tests

The project includes comprehensive test coverage for both frontend and backend. See [TESTING.md](TESTING.md) for detailed testing documentation.

**Run all tests:**
```bash
chmod +x run-tests.sh
./run-tests.sh
```

**Backend tests only:**
```bash
cd backend
npm install  # First time only
npm test     # Run with coverage
npm run test:watch  # Watch mode
```

**Frontend tests only:**
```bash
cd frontend
npm install  # First time only
npm test     # Run with coverage
npm run test:watch  # Watch mode
```

**Test Coverage:**
- Backend: 75% branches, 80% functions/lines/statements
- Frontend: 70% branches, 75% functions/lines/statements
- Backend: Jest with comprehensive controller and middleware tests
- Frontend: Vitest with React Testing Library for hooks and utils
- See coverage reports in `backend/coverage` and `frontend/coverage`

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists and user has permissions

### Port Conflicts
- Change ports in `docker-compose.yml` if 5432, 3001, or 5173 are in use
- Update corresponding environment variables

### Migration Errors
- Ensure database is accessible
- Check migration script for syntax errors
- Drop and recreate database if needed (development only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
