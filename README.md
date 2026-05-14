# PhishSim — Phishing Awareness Simulation Platform

A full-stack web application for running phishing simulation campaigns to measure and improve employee security awareness.

Built during an internship at **Eskişehir Teknik Üniversitesi Bilgi İşlem Daire Başkanlığı**.

![Dashboard](https://placehold.co/900x400?text=PhishSim+Dashboard)

## Features

- **Email Template Editor** — HTML editor with dynamic variables (`{{name}}`, `{{email}}`, `{{link}}`)
- **Template Preview** — Real-time preview with sample data before sending
- **Campaign Management** — Create campaigns, assign templates, select target users, launch with one click
- **User Management** — Manage target user lists with department grouping
- **Click & Form Tracking** — Track who opened the link and who submitted credentials
- **Phishing Landing Page** — Realistic fake login page served per campaign/user
- **Awareness Page** — Users are redirected to an educational page after submitting
- **Reports & Analytics** — Click rate, submit rate, per-user risk classification (Safe / Risky / High Risk)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI Library | Mantine UI v7 |
| Backend | Flask (Python) |
| Database | SQLite via SQLAlchemy ORM |
| Email Testing | MailHog (SMTP mock) |
| Containers | Docker + Docker Compose |

## Quick Start

### Option A — Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MailHog (email inbox): http://localhost:8025

### Option B — Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates/` | List all templates |
| POST | `/api/templates/` | Create template |
| GET | `/api/users/` | List target users |
| POST | `/api/users/` | Add user |
| GET | `/api/campaigns/` | List campaigns |
| POST | `/api/campaigns/` | Create campaign |
| POST | `/api/campaigns/{id}/start` | Send emails to all targets |
| GET | `/api/stats/` | Global statistics |
| GET | `/api/stats/campaigns/{id}` | Per-campaign report |
| GET | `/track/click/{cid}/{uid}` | Track link click |
| GET | `/landing/{cid}/{uid}` | Phishing landing page |
| POST | `/submit/{cid}/{uid}` | Track form submission |

## Email Template Variables

| Variable | Description |
|----------|-------------|
| `{{name}}` | Recipient's full name |
| `{{email}}` | Recipient's email address |
| `{{link}}` | Personalized tracking link (auto-generated) |

## Project Structure

```
phishing-sim/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # Flask blueprints
│   │   └── services/        # Email & campaign logic
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Templates, Users, Campaigns
│       ├── components/      # CampaignReport
│       ├── services/        # API client
│       └── types/           # TypeScript interfaces
└── docker-compose.yml
```

## Disclaimer

This tool is intended **only for authorized security awareness training**. Running phishing simulations against users without explicit organizational approval is illegal and unethical. Always obtain written authorization before running any campaign.
