# BuildSignal — PRD & Memory

## Problem Statement
Build a full-stack web app called "BuildSignal" (domain: buildsignalintell.com) that helps e-commerce store owners identify high and low demand products using AI (Claude claude-4-sonnet-20250514).

## Architecture

### Backend (FastAPI)
- `POST /api/analyze` — Takes business description, calls Claude via emergentintegrations, returns JSON analysis
- MongoDB stores analysis records
- Emergent Universal Key for Anthropic LLM access

### Frontend (React)
- `LandingPage.jsx` — Hero + features + CTA
- `AnalyzePage.jsx` — Form + freemium gate + results rendering
- `ResultsDashboard.jsx` — Summary, high/low demand, Recharts chart, seasonality, action cards, PDF/CSV export
- `UpgradeModal.jsx` — Freemium gate dialog (3 free analyses limit)

## User Personas
- E-commerce store owners
- Online sellers on Shopify/Amazon/Etsy
- Product managers researching demand

## Core Requirements (Static)
- [x] Business description form (niche, products, target_audience, price_range, sales_channels)
- [x] AI analysis via Claude claude-4-sonnet-20250514
- [x] High demand products (green) + low demand products (red) two-column layout
- [x] Recharts confidence bar chart
- [x] Seasonality timeline
- [x] 3 action cards
- [x] PDF export (with chart capture via html2canvas + jsPDF)
- [x] CSV export (PapaParse)
- [x] Freemium: 3 free analyses via localStorage, upgrade modal gate
- [x] Dark/light mode toggle (default: dark)
- [x] Mobile responsive
- [x] Accent color: #1ed760 (Spotify green)
- [x] Fonts: Outfit (headings) + IBM Plex Sans (body)

## What's Been Implemented
- 2025-02: Full MVP built and tested (100% pass rate)
  - Landing page with hero, features section, CTA
  - Analysis form with 5 input fields + validation
  - AI integration with Claude claude-4-sonnet-20250514 via Emergent Universal Key
  - Complete results dashboard (all 6 sections)
  - Freemium gate at 3 analyses (localStorage-based)
  - PDF export with chart screenshots
  - CSV data export
  - Dark/light mode toggle

## Prioritized Backlog

### P0 (Done)
- All core features above

### P1 (Next phase)
- Server-side validation for empty inputs to /api/analyze
- Save analysis history (DB + UI for past analyses)
- Real payment integration (Stripe) for upgrade flow
- User accounts / authentication

### P2 (Future)
- Competitor comparison analysis
- Product trend charts over time
- Email report delivery
- Shareable analysis links

## Dependencies
- emergentintegrations (Anthropic Claude)
- recharts (charts)
- jspdf + html2canvas (PDF export)
- papaparse (CSV export)
