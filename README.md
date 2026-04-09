# G-Agency Events 🎪

A full-stack event management platform built with **AdonisJS 6**, **Inertia.js**, and **React**. It powers a public-facing web app for users to discover and register for events, and exposes a **REST API** for an admin mobile app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | AdonisJS 6 (Node.js, TypeScript) |
| Frontend | React 19 + Inertia.js (SSR enabled) |
| Styling | Tailwind CSS v4 |
| Database | MySQL 8 |
| Search | Typesense |
| Auth (web) | AdonisJS Session Auth |
| Auth (API) | Custom JWT-style tokens |
| Email | SMTP (Brevo/MailerSend/etc.) |
| Storage | Local filesystem (or S3/Cloudinary) |
| Reverse proxy | Nginx |
| Containerization | Docker + Docker Compose |

---

## Prerequisites

- **Node.js 20+** — [Install via nvm](https://github.com/nvm-sh/nvm)
- **npm** (comes with Node.js)
- **MySQL 8** — or use Docker (recommended)
- **Git**
- **Docker & Docker Compose** — for containerized development/production

### Install Node.js via nvm (recommended)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart your shell, then:
nvm install 20
nvm use 20
```

---

## Quick Start — Local Development (without Docker)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd g-agency-events
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Generate required secrets:

```bash
node ace generate:key             # → APP_KEY
node ace generate:admin-token     # → ADMIN_API_TOKEN
node ace generate:encryption-key  # → TOKEN_ENCRYPTION_KEY
```

Create a Firebase placeholder (if not using push notifications):

```bash
mkdir -p config
echo '{"type":"service_account","project_id":"placeholder"}' > config/firebase-service-account.json
```

### 3. MySQL database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE events_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'events_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON events_platform.* TO 'events_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Run migrations and seed

```bash
node ace migration:run
node ace db:seed
```

This creates 1 admin + 100 regular users, 30 events, and sample registrations.

### 5. Start the dev server

```bash
npm run dev
```

App available at **http://localhost:3333**

**Default credentials:**
- Admin: `admin@events.dz` / `Admin@123`
- Users: `user1@events.dz` to `user100@events.dz` / `Password@123`

---

## Quick Start — Docker Development

Docker handles MySQL, Typesense, Nginx, and the app in one command.

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
APP_KEY=<run: node ace generate:key>
ADMIN_API_TOKEN=<run: node ace generate:admin-token>
TOKEN_ENCRYPTION_KEY=<run: node ace generate:encryption-key>
ADMIN_PASSWORD=your_admin_password
DB_HOST=db
DB_ROOT_PASSWORD=rootpassword
DB_USER=events_user
DB_PASSWORD=securepassword
DB_DATABASE=events_platform
TYPESENSE_ENABLED=true
TYPESENSE_HOST=typesense
TYPESENSE_API_KEY=your_typesense_key_here
APP_URL=http://localhost:8080
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

Create the Firebase placeholder:

```bash
mkdir -p config
echo '{"type":"service_account","project_id":"placeholder"}' > config/firebase-service-account.json
```

### 3. Build and start

```bash
# Using Makefile (recommended)
make dev-setup

# Or manually
docker compose -f docker-compose.dev.yml up -d --build
# Wait ~30s for DB to initialize, then:
docker compose -f docker-compose.dev.yml exec app node ace migration:run --force
docker compose -f docker-compose.dev.yml exec app node ace db:seed
```

App available at **http://localhost:8080** (via Nginx) or **http://localhost:3333** (direct).

### Useful Docker commands

```bash
docker compose -f docker-compose.dev.yml logs -f app     # View logs
docker compose -f docker-compose.dev.yml exec app sh      # Shell access
docker compose -f docker-compose.dev.yml down              # Stop all
docker compose -f docker-compose.dev.yml down -v           # Stop + delete data
```

---

## Production Deployment — Docker

### Using the deploy script

The `deploy-prod.sh` script automates the full production workflow with pre-flight checks, backups, health checks, and rollback support:

```bash
# Requires .env.prod to exist
cp .env.example .env.prod
# Edit .env.prod with production values (NODE_ENV=production, real SMTP, etc.)

./deploy-prod.sh
```

### Using Makefile

```bash
make prod-deploy   # Build → stop → start → migrate → typesense setup
```

### Manual deployment

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
sleep 20
docker compose -f docker-compose.prod.yml exec app node ace migration:run --force
docker compose -f docker-compose.prod.yml exec app node ace setup:typesense --force
docker compose -f docker-compose.prod.yml exec app node ace index:all
```

App available at **http://localhost:80** (configurable via `NGINX_HTTP_PORT`).

---

## Deployment — Render.com

The project includes a `Dockerfile` suitable for Render deployment.

1. Push to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → New → Web Service
3. Connect your repository
4. Set required environment variables in the Render dashboard
5. Deploy

**Notes for Render free tier:**
- Set `TYPESENSE_ENABLED=false` (Typesense requires a persistent container)
- Use an external MySQL provider: [PlanetScale](https://planetscale.com), [Railway](https://railway.app), or [Aiven](https://aiven.io)
- File uploads won't persist (ephemeral disk) — use Cloudinary or S3 for production

---

## Makefile Commands

### Development

| Command | Description |
|---|---|
| `make dev-setup` | Build images, start services, run migrations & seed |
| `make dev-up` | Start development environment |
| `make dev-down` | Stop development environment |
| `make dev-restart` | Restart development services |
| `make dev-build` | Build development images |
| `make dev-logs` | View application logs |
| `make dev-logs-all` | View all service logs |
| `make dev-shell` | Access container shell |
| `make dev-status` | Show service status |
| `make dev-clean` | Remove containers and volumes |
| `make dev-info` | Show access URLs |

### Production

| Command | Description |
|---|---|
| `make prod-deploy` | Full production deployment |
| `make prod-build` | Build production images |
| `make prod-up` | Start production environment |
| `make prod-down` | Stop production environment |
| `make prod-restart` | Restart production services |
| `make prod-logs` | View production logs |
| `make prod-shell` | Access production shell |
| `make prod-status` | Show production status |
| `make prod-clean` | Remove production containers/volumes |
| `make prod-info` | Show production access URLs |

### Database

| Command | Description |
|---|---|
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed database |
| `make db-reset` | Rollback → migrate → seed |
| `make db-shell` | Access MySQL shell |
| `make db-backup` | Backup database to file |
| `make db-restore` | Restore from backup |

### Typesense

| Command | Description |
|---|---|
| `make typesense-setup` | Setup collections |
| `make typesense-index` | Reindex all data |
| `make typesense-reset` | Reset collections and reindex |

### Utilities

| Command | Description |
|---|---|
| `make health` | Check service health (dev + prod) |
| `make stats` | Container resource usage |
| `make doctor` | System diagnostics |
| `make clean-all` | Nuclear cleanup (all Docker resources) |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `APP_KEY` | ✅ | Encryption key — `node ace generate:key` |
| `DB_HOST` | ✅ | MySQL host (`127.0.0.1` local, `db` in Docker) |
| `DB_PORT` | ✅ | MySQL port (default `3306`) |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_DATABASE` | ✅ | MySQL database name |
| `DB_ROOT_PASSWORD` | 🐳 | MySQL root password (Docker only) |
| `ADMIN_PASSWORD` | ✅ | Password for the admin mobile API |
| `ADMIN_API_TOKEN` | ✅ | API token — `node ace generate:admin-token` |
| `TOKEN_ENCRYPTION_KEY` | ✅ | 64-char hex key — `node ace generate:encryption-key` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ | Path to Firebase JSON (use placeholder if not needed) |
| `TYPESENSE_ENABLED` | ❌ | Set `true` to enable full-text search |
| `TYPESENSE_HOST` | ❌ | Typesense host |
| `TYPESENSE_API_KEY` | ❌ | Typesense API key |
| `SMTP_HOST` | ❌ | SMTP server host |
| `SMTP_USERNAME` | ❌ | SMTP username |
| `SMTP_PASSWORD` | ❌ | SMTP password |
| `MAIL_FROM_ADDRESS` | ❌ | Sender email address |
| `NGINX_PORT` | 🐳 | Nginx external port — dev default: `8080` |
| `NGINX_HTTP_PORT` | 🐳 | Nginx external port — prod default: `80` |

---

## Project Structure

```
g-agency-events/
├── app/
│   ├── controllers/
│   │   ├── api/admin/          # REST API controllers (mobile app)
│   │   ├── auth_controller.ts  # Web authentication
│   │   ├── events_controller.ts
│   │   └── registrations_controller.ts
│   ├── models/                 # Lucid ORM models
│   ├── middleware/             # Auth, rate limiting, CSRF
│   ├── services/               # Email, QR code, Typesense, tokens
│   └── validators/             # VineJS validators
├── config/                     # AdonisJS config files
├── database/
│   ├── migrations/             # Database schema
│   └── seeders/               # Sample data
├── inertia/
│   ├── app/                   # React entry points
│   ├── pages/                 # Inertia page components
│   ├── components/            # Reusable React components
│   ├── hooks/                 # React hooks
│   ├── stores/                # Zustand state stores
│   └── types/                 # TypeScript types
├── resources/views/emails/    # Edge.js email templates
├── start/
│   ├── routes/
│   │   ├── web.ts             # Web routes (Inertia)
│   │   └── api.ts             # Admin REST API routes
│   ├── kernel.ts              # Middleware registration
│   └── env.ts                 # Environment validation
├── nginx/
│   ├── nginx.conf             # Main Nginx config
│   ├── dev.conf               # Dev server block
│   └── prod.conf              # Production server block
├── scripts/                   # Build & utility scripts
├── docker-compose.dev.yml     # Development Docker setup
├── docker-compose.prod.yml    # Production Docker setup
├── Dockerfile                 # Multi-stage Dockerfile (dev + prod targets)
├── Dockerfile.typesense       # Custom Typesense with curl for health checks
├── Makefile                   # Docker workflow commands
└── deploy-prod.sh             # Automated production deployment
```

---

## Available Routes

### Web (Inertia pages)

| Route | Description |
|---|---|
| `GET /` | Home page |
| `GET /events` | Browse events (with search & filters) |
| `GET /events/:id` | Event detail page |
| `GET /auth/login` | Login page |
| `GET /auth/register` | Registration page |
| `GET /profile` | User profile (auth required) |
| `GET /registrations` | My registrations (auth required) |
| `GET /registrations/:id` | Registration detail + QR code |

### Admin REST API (mobile app)

All protected endpoints require `Authorization: Bearer <token>`.

**Base URL:** `/api/admin`

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/login` | Login and get access token |
| `POST` | `/auth/refresh` | Refresh access token |
| `GET` | `/auth/check` | Verify token validity |
| `POST` | `/auth/logout` | Logout current device |
| `GET` | `/events` | List events (with search) |
| `POST` | `/events` | Create event |
| `PUT` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Delete event |
| `GET` | `/registrations` | List registrations |
| `POST` | `/registrations/verify` | Verify a QR code |
| `POST` | `/registrations/confirm` | Mark attendance via QR |
| `GET` | `/users` | List users |
| `PATCH` | `/users/:id/toggle-block` | Block/unblock user |
| `GET` | `/exports/events/csv` | Export events as CSV |
| `GET` | `/exports/registrations/excel` | Export registrations as Excel |

See `API_DOCUMENTATION_FOR_MOBILE.txt` for the full reference including request/response schemas.

---

## Ace Commands

```bash
# Key management
node ace generate:key               # Generate APP_KEY
node ace generate:admin-token       # Generate ADMIN_API_TOKEN
node ace generate:encryption-key    # Generate TOKEN_ENCRYPTION_KEY

# Database
node ace migration:run              # Run pending migrations
node ace migration:rollback         # Roll back last batch
node ace migration:status           # Show migration status
node ace db:seed                    # Seed with sample data

# Typesense search index
node ace setup:typesense            # Create Typesense collections
node ace index:events               # Index all events
node ace index:users                # Index all users
node ace index:registrations        # Index all registrations
node ace index:all                  # Index everything

# Development
node ace serve --hmr                # Start dev server with hot reload
node ace build                      # Build for production
node ace routes                     # List all registered routes
```

---

## Typesense (Full-Text Search)

Typesense is optional. If `TYPESENSE_ENABLED=false` (or the service is unreachable), all search endpoints fall back to database queries automatically.

To enable it:

1. Set `TYPESENSE_ENABLED=true` in your `.env`
2. Make sure Typesense is running (included in the Docker setup)
3. Create collections and index data:

```bash
node ace setup:typesense --force
node ace index:all
```

---

## Email Setup

The app sends transactional emails for:
- Email verification on signup
- Password reset
- Event registration confirmation (with QR code attachment)
- Welcome email after verification

For local development, email errors are caught and logged — the app won't crash if SMTP isn't configured.

For production, we recommend [Brevo](https://www.brevo.com) (free tier available):

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your_brevo_email@example.com
SMTP_PASSWORD=your_brevo_smtp_key
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

---

## Troubleshooting

### `APP_KEY is missing`
```bash
node ace generate:key
# Copy the output into your .env as APP_KEY=<value>
```

### `TOKEN_ENCRYPTION_KEY must be exactly 64 characters`
```bash
node ace generate:encryption-key
# Copy the output into your .env
```

### MySQL connection refused
```bash
sudo service mysql start      # Ubuntu
# or
sudo systemctl start mysql
```

### Migrations fail
```bash
node ace migration:status     # Check what's pending
node ace migration:rollback   # Roll back if needed
node ace migration:run        # Re-run
```

### Port already in use
```bash
lsof -i :3333  # Find what's using the port
# Or change PORT in your .env
```

### Docker: container exits immediately
```bash
docker compose -f docker-compose.dev.yml logs app
# Check the logs for the specific error
```

### Docker: database connection failed
```bash
docker compose -f docker-compose.dev.yml ps       # Check DB is running
docker compose -f docker-compose.dev.yml logs db   # View DB logs
docker compose -f docker-compose.dev.yml restart db
```

### Run diagnostics
```bash
make doctor    # Checks Docker, env files, nginx configs, containers
```

---

## License

UNLICENSED — private project.
