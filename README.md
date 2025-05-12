# B2B Prospecting Tool

A full‑stack application for searching, saving, and enriching company profiles with AI‑generated summaries. Built with NestJS + MongoDB + BullMQ for the backend, a standalone worker for scraping & summarization, and React + Vite + Tailwind + React Query on the frontend.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)  
2. [Architecture Overview](#architecture-overview)  
3. [Database Schema](#database-schema)  
4. [Design Choices & Trade‑offs](#design-choices--trade‑offs)  
5. [Assumptions](#assumptions)  
6. [Future Improvements](#future-improvements)  

---

## Setup Instructions

### Prerequisites

- Node.js (≥ 22.x) & pnpm(>= 10.10)  
- Docker & Docker Compose  
- Playwright dependencies (for the scraping worker)  
- OpenAI API key

### 1. Clone the repo

```bash
git clone https://github.com/git-buzzlightyear/FullStack-Challenge.git
cd FullStack-Challenge
```

### 2. Bring up infrastructure

```bash
docker-compose up -d
# – mongo:27017
# – redis:6379

pnpm run seed
# Seed data (companies mock data)

pnpm install
# install all packages to monorepo

pnpm run dev
# run backend, frontend and job worker
```

### 3. Backend (NestJS API)

```bash
cd server
pnpm install
cp .env.example .env
# fill in MONGO_URL, REDIS_URL, PORT, etc.
pnpm run dev
```

### 4. Worker (Scraper & Summarizer)

```bash
cd worker
pnpm install
cp .env.example .env
# fill in MONGO_URL, OPENAI_API_KEY, REDIS_URL
pnpm run dev
```

### 5. Frontend (React + Vite)

```bash
cd client
pnpm install
cp .env.example .env
pnpm run dev
```

---

## Architecture Overview

```bash
┌───────────────┐     ┌────────┐     ┌───────────┐
│               │     │        │     │           │
│   Frontend    ├────▶│  API   ├────▶│   Mongo   │
│ (React/Vite)  │ GET │(NestJS)│CRUD │ (Mongoose)│
│               │     │        │     │           │
└───────────────┘     └────────┘     └────┬──────┘
                                          │
                                          ▼
                                       ┌──────┐
                                       │Redis │
                                       └──┬───┘
                                          │
                                          ▼
                                    ┌────────────┐
                                    │  Worker    │
                                    │ (BullMQ)   │
                                    └────────────┘
```

1. Search & filter: MongoDB aggregation with a single text index + B‑tree indexes.

2. Saved Prospects: Dedicated collection linking userId ↔ companyId.

3. Enrichment pipeline:

    - API ensureSummary enqueues a job

    - Worker scrapes with Playwright + calls OpenAI

    - Worker writes back companies.summary

## Database Schema

### companies collection

```bash
Field	        Type	    Index	        Notes
id	            String	    unique	        primary identifier
name	        String	    text	        full‑text across multiple fields
industry    	String	    text & B‑tree	text search + equality filter
locality	    String	    text	        text search
region	        String	    text	        text search
website	        String		
linkedin_url	String		
founded	        String	    B‑tree          ($toInt cast)	stored as string, cast to int
size	        String		                stored ranges ("1-10", "10001+")
country	        String	    B‑tree	        equality filter
summary	        String		                AI‑generated, initially empty
createdAt	    Date		                timestamps
updatedAt	    Date		                timestamps
```

### prospects collection

```bash
userId	        String	    B‑tree	    identifies the current user
companyId	    String	    B‑tree  	references a companies.id
createdAt	    Date		            when saved
updatedAt	    Date		
```

## Design Choices & Trade‑offs

- MongoDB only: removed Elasticsearch to simplify infra and leverage aggregation/text indexes.

- NestJS: structured modules, DI, built‑in validation (class-validator).

- BullMQ + Redis: robust background queue for scraping + AI calls; decouples latency.

- Playwright: reliable page scraping; fragments to first 500 words.

- OpenAI: GPT‐4o-mini for concise summaries.

- React + Vite + TypeScript: fast HMR, type safety.

- React Query: cache, background refetching, mutation handling.

- Zustand: lightweight client‑side “saved” state fallback.

- Debounce hook: avoids excessive network calls on filter inputs.

## Assumptions

- Dev environment: Windows + Docker (no WSL required).

- API auth: stubbed via x-user header → single “demo-user”.

- Data file: newline‑delimited JSON, ~6.6 GB, loaded in batches.

- Summary: up to 80 words, generated asynchronously.

- Deep paging: acceptable via $skip for moderate page counts.

## Future Improvements

- Testing: end‑to‑end tests (Cypress), unit tests (Jest)

- Authentication: real user accounts, OAuth / JWT

- Pagination: cursor/range queries for large offsets

- Health & metrics: Prometheus, Grafana dashboards

- Error handling: global filters, structured logs, retry strategies

- CI/CD: GitHub Actions, Docker image builds, deployment pipelines

- UI enhancements: accessibility audits, infinite scroll, mobile layout

- AI search layer: natural language → filter mapping via LLM

- GraphQL: alternative API for flexible queries

- Dockerization: Dockerfiles for all services, multi‑stage builds

- Schema migrations: MongoDB–Migrate or similar

- Caching: Redis cache for hot queries