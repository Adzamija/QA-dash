# QA Lite

Jednostavna QA platforma sa 8 AI agenata za automatizaciju testiranja. Inspirirana QA Orchestra-om, ali prilagođena za lokalnu upotrebu sa kompletnim user management sistemom.

## 🚀 Quick Start

### 1. Instalacija

```bash
# Kloniraj repo
git clone <your-repo-url>
cd qa-lite

# Instaliraj dependencies
npm install

# Pokreni development server
npm run dev
```

### 2. Login

Otvori aplikaciju u browseru i prijavi se sa:
- **Username:** `muhamed`
- **Password:** `muhamed`

### 3. Konfiguracija API Ključeva

Nakon logina:
1. Klikni na **🔑 API Tokens** u sidebar-u
2. Popuni sve potrebne ključeve (Claude, GitHub, Azure, TestRail, JIRA, Playwright)
3. Klikovi se automatski čuvaju u browseru (localStorage)

## ✨ Funkcionalnosti

### 🔐 User Management
- **Login sistem** sa sesijama
- **Admin panel** za dodavanje/brisanje korisnika
- **Promjena lozinke** za svakog korisnika
- **Role-based access** (admin/user)

### 🔑 Token Management
- **Centralizovano upravljanje** svim API ključevima na jednom mjestu
- **Status pregled** koji servisi su konfigurisani
- **Show/hide** za osjetljive ključeve
- **Automatsko čuvanje** u localStorage

### 📜 Test History
- **Automatsko čuvanje** svih testiranja
- **Filter** po agentu
- **Pregled** input/output za svaki test
- **Copy output** u clipboard
- **Brisanje** pojedinačnih testova ili cijele historije

### 🤖 8 QA Agenata

#### Tier 1 — Core QA Agents
- **🔍 Functional Reviewer** — Poredi PR sa zahtjevima (GitHub/Azure CLI)
- **📋 Test Scenario Designer** — ISTQB test caseovi → TestRail format
- **🐛 Bug Reporter** — QA nalazi → JIRA ticketi

#### Tier 2 — Automation & Validation
- **⚡ Automation Writer** — 5-fazni generator (Novi test / Update-Existing)
- **🌐 Browser Validator** — Playwright browser testiranje

#### Tier 3 — Advanced Workflows
- **🎼 Orchestrator** — Full pipeline (PR → testovi → JIRA)
- **📦 Release Analyzer** — Cross-repo analiza
- **📝 Manual Validator** — Manualno testiranje sa JIRA kontekstom

## 🔧 Kako koristiti

1. **Login** — Prijavi se sa kredencijalima
2. **Konfiguriraj tokene** — Idi na API Tokens i popuni ključeve
3. **Odaberi agenta** — Klikni na agenta u sidebar-u
4. **Unesi input** — Paste PR, AC, JIRA ticket, itd.
5. **Pokreni agenta** — Klikni "Run Agent"
6. **Pregledaj output** — Markdown report spreman za copy/paste
7. **Pregledaj historiju** — Svi testovi su sačuvani automatski

## 🔒 Sigurnost

- Svi podaci (useri, tokeni, testovi) se čuvaju **lokalno u browseru** (localStorage)
- **Nikada** se ne šalju na vanjske servere osim kada se koriste CLI alati
- API ključevi su **maskirani** u UI-u
- **Logout** opcija za sigurno odjavljivanje
- **Clear All Data** opcija za brisanje svega

## 📁 Struktura

```
qa-lite/
├── src/
│   ├── components/        # UI komponente
│   │   ├── Login.tsx      # Login stranica
│   │   ├── Sidebar.tsx    # Navigacija
│   │   ├── AgentView.tsx  # Pregled agenta
│   │   ├── Tokens.tsx     # API token management
│   │   ├── Settings.tsx   # User management
│   │   └── History.tsx    # Test history
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx        # User authentication
│   │   ├── TokensContext.tsx      # API tokens
│   │   └── TestHistoryContext.tsx # Test runs
│   └── data/
│       └── agents.ts      # Agent definitions
└── README.md
```

## 🛠️ Development

```bash
# Development server
npm run dev

# Build za production
npm run build

# Preview production build
npm run preview
```

## 📝 Napomene

- Ovo je **potpuno lokalna aplikacija** — svi podaci su u browseru
- Agenti koriste **simulirane output-e** za demo (u produkciji bi se koristio Claude API)
- **CLI integracije** (GitHub, JIRA, TestRail) se koriste van browsera
- **Playwright** mora biti instaliran lokalno za browser validaciju
- Svi output-i su u **Markdown formatu** — copy/paste u GitHub/JIRA/TestRail

## 🔄 Migracija sa QA Orchestra

QA Lite je pojednostavljena verzija QA Orchestra sa:
- ✅ Lokalno čuvanje podataka (bez .env fajla)
- ✅ User management sistem
- ✅ Test history sa pregledom
- ✅ Centralizovani token management
- ✅ Jednostavniji UI

## 🙏 Zahvala

Inspirirano sa [QA Orchestra](https://github.com/Anasss/qa-orchestra) — pojednostavljeno za lokalnu upotrebu.

## 📄 Licenca

MIT
# QA-dash
# QA-dash
