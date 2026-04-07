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

Before you start, make sure you have the following installed on your **WSL Ubuntu** system:

- **Node.js 20+** — [Install via nvm](https://github.com/nvm-sh/nvm)
- **npm** (comes with Node.js)
- **MySQL 8** — or use Docker (recommended)
- **Git**

### Install Node.js via nvm (recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your shell, then:
nvm install 20
nvm use 20
node --version   # should print v20.x.x
```

---

## Quick Start (Local Development — without Docker)

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd g-agency-events

npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# Generate with: node ace generate:key
APP_KEY=

# Your local MySQL credentials
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=events_platform

# Admin API password (for the mobile app)
ADMIN_PASSWORD=your_admin_password

# Generate with: node ace generate:admin-token
ADMIN_API_TOKEN=

# Generate with: node ace generate:encryption-key
TOKEN_ENCRYPTION_KEY=

# Firebase (required at startup — use a dummy path if not using push notifications)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Email (optional for local dev — errors are caught gracefully)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="G-Agency Events"
MAIL_REPLY_TO_ADDRESS=support@yourdomain.com
MAIL_REPLY_TO_NAME="Support Team"
```

#### Generate required secrets

```bash
node ace generate:key          # copy output → APP_KEY
node ace generate:admin-token  # copy output → ADMIN_API_TOKEN
node ace generate:encryption-key  # copy output → TOKEN_ENCRYPTION_KEY
```

#### Create a Firebase placeholder (if not using push notifications)

```bash
mkdir -p config
echo '{"type":"service_account","project_id":"placeholder"}' > config/firebase-service-account.json
```

### 3. Set up the MySQL database

```bash
# Log into MySQL
mysql -u root -p

# Inside MySQL:
CREATE DATABASE events_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'events_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON events_platform.* TO 'events_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Run migrations and seed data

```bash
node ace migration:run
node ace db:seed
```

This creates 101 users (1 admin + 100 regular users), 30 events, and sample registrations.

### 5. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3333**

**Default credentials:**
- Admin web: `admin@events.dz` / `Admin@123`
- Regular users: `user1@events.dz` to `user100@events.dz` / `Password@123`

---

## Quick Start (Docker — recommended)

Docker handles MySQL, Typesense, Nginx, and the app in one command.

### 1. Install Docker

```bash
# Install Docker Engine on WSL Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

### 2. Create the Docker environment file

```bash
cp .env.example .env.docker
```

Edit `.env.docker` with these minimum settings:

```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0

# Generate these:
APP_KEY=<run: node ace generate:key>
ADMIN_API_TOKEN=<run: node ace generate:admin-token>
TOKEN_ENCRYPTION_KEY=<run: node ace generate:encryption-key>

# Database (uses Docker internal network)
DB_HOST=db
DB_PORT=3306
DB_ROOT_PASSWORD=rootpassword
DB_USER=events_user
DB_PASSWORD=securepassword
DB_DATABASE=events_platform

# Typesense (uses Docker internal network)
TYPESENSE_ENABLED=true
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your_typesense_key_here

# App URL (as seen from browser)
APP_URL=http://localhost:8080

# Firebase placeholder
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="G-Agency Events"
MAIL_REPLY_TO_ADDRESS=support@example.com
MAIL_REPLY_TO_NAME="Support Team"

# Session
SESSION_DRIVER=cookie
DRIVE_DISK=fs
LOG_LEVEL=info

ADMIN_PASSWORD=your_admin_password

# Nginx port
NGINX_PORT=8080
```

Generate the secrets first (you need Node installed locally, or skip and set them manually):

```bash
node ace generate:key
node ace generate:admin-token
node ace generate:encryption-key
```

Create the Firebase placeholder:

```bash
mkdir -p config
echo '{"type":"service_account","project_id":"placeholder"}' > config/firebase-service-account.json
```

### 3. Build and start

```bash
# Build the Docker image and start all services
docker compose -f docker-compose.dev.yml up -d --build

# Wait ~30 seconds for the database to initialize, then run:
docker compose -f docker-compose.dev.yml exec app node ace migration:run --force
docker compose -f docker-compose.dev.yml exec app node ace db:seed
```

The app is now available at **http://localhost:8080**

### Useful Docker commands

```bash
# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Open a shell inside the container
docker compose -f docker-compose.dev.yml exec app sh

# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove all data (volumes)
docker compose -f docker-compose.dev.yml down -v
```

---

## Makefile Commands

If you use the `docker-compose.dev.yml` setup, you can also use the Makefile:

```bash
make dev-setup    # Build images, start services, run migrations & seed
make dev-up       # Start development environment
make dev-down     # Stop development environment
make dev-logs     # View application logs
make dev-shell    # Access container shell
make db-migrate   # Run migrations
make db-seed      # Seed the database
make db-reset     # Rollback → migrate → seed
make db-backup    # Backup the database
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `APP_KEY` | ✅ | Encryption key — generate with `node ace generate:key` |
| `DB_HOST` | ✅ | MySQL host (`127.0.0.1` local, `db` in Docker) |
| `DB_PORT` | ✅ | MySQL port (default `3306`) |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_DATABASE` | ✅ | MySQL database name |
| `ADMIN_PASSWORD` | ✅ | Password for the admin mobile API |
| `ADMIN_API_TOKEN` | ✅ | API token — generate with `node ace generate:admin-token` |
| `TOKEN_ENCRYPTION_KEY` | ✅ | 64-char hex key — generate with `node ace generate:encryption-key` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ | Path to Firebase JSON (use placeholder if not needed) |
| `TYPESENSE_ENABLED` | ❌ | Set `true` to enable full-text search |
| `TYPESENSE_HOST` | ❌ | Typesense host |
| `TYPESENSE_API_KEY` | ❌ | Typesense API key |
| `SMTP_HOST` | ❌ | SMTP server host |
| `SMTP_USERNAME` | ❌ | SMTP username |
| `SMTP_PASSWORD` | ❌ | SMTP password |
| `MAIL_FROM_ADDRESS` | ❌ | Sender email address |

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
├── nginx/                     # Nginx config files
├── scripts/                   # Build & utility scripts
├── docker-compose.dev.yml     # Development Docker setup
├── docker-compose.prod.yml    # Production Docker setup
└── Dockerfile.adonis          # Multi-stage Dockerfile
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
node ace serve --hmr                # Start dev server with hot reload (same as npm run dev)
node ace build                      # Build for production
node ace routes                     # List all registered routes
```

---

## Typesense (Full-Text Search)

Typesense is optional. If `TYPESENSE_ENABLED=false` (or the service is unreachable), all search endpoints fall back to database queries automatically.

To enable it:

1. Set `TYPESENSE_ENABLED=true` in your `.env`
2. Make sure Typesense is running (it's included in the Docker setup)
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

## Deployment (Render.com)

The project includes a `render.yaml` for one-click deployment.

1. Push to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → New → Blueprint
3. Connect your repository — Render detects `render.yaml` automatically
4. Set the required environment variables in the Render dashboard
5. Deploy

**Notes for Render free tier:**
- Set `TYPESENSE_ENABLED=false` (Typesense requires a persistent container)
- Use an external MySQL provider: [PlanetScale](https://planetscale.com), [Railway](https://railway.app), or [Aiven](https://aiven.io)
- File uploads won't persist (ephemeral disk) — integrate Cloudinary or S3 for production

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
Make sure MySQL is running:
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
# Find what's using port 3333
lsof -i :3333
# Or change the PORT in your .env
```

### Docker: container exits immediately
```bash
docker compose -f docker-compose.dev.yml logs app
# Check the logs for the specific error
```

---

## License

UNLICENSED — private project.
