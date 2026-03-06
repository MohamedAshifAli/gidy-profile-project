# The Profile Project

A high-fidelity, full-stack profile page application inspired by [Gidy.ai](https://gidy.ai). Built as a technical challenge demonstrating end-to-end development capabilities — from database schema to pixel-perfect CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

---

##  Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling**  | Vanilla CSS with CSS Custom Properties (design tokens) |
| **Backend**  | Next.js API Routes (RESTful)         |
| **Database** | SQLite via `better-sqlite3`          |
| **Font**     | Inter (Google Fonts)                 |

### Why These Choices?

- **Next.js App Router** — Server and client components, API routes, and zero-config deployment to Vercel in a single framework.
- **SQLite** — Zero-configuration, file-based database perfect for a single-profile app. No external database service needed — the app is fully self-contained.
- **Vanilla CSS** — Full control over the design system without framework overhead. CSS custom properties enable the dark mode toggle with no runtime cost.

---

##  Setup Instructions

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd the-profile-project

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000**.

> The SQLite database is automatically created and seeded with sample data on the first request.

### Production Build

```bash
npm run build
npm start
```

---

##  Project Architecture

```
the-profile-project/
├── app/
│   ├── api/                    # RESTful API Routes
│   │   ├── profile/route.ts    # GET/PUT profile data
│   │   ├── skills/route.ts     # POST/DELETE skills
│   │   ├── endorsements/route.ts # POST skill endorsements
│   │   ├── social-links/route.ts # CRUD social links
│   │   ├── experience/route.ts   # CRUD work experience
│   │   └── settings/route.ts    # GET/PUT app settings (theme)
│   ├── components/             # React Components
│   │   ├── ProfileHeader.tsx   # Cover image, avatar, name, edit button
│   │   ├── BioSection.tsx      # About text and contact info
│   │   ├── SocialLinks.tsx     # Social media links with icons
│   │   ├── SkillsSection.tsx   # Skills with endorsement system
│   │   ├── WorkTimeline.tsx    # Animated work experience timeline
│   │   ├── EditProfileModal.tsx # Tabbed edit modal
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   ├── Toast.tsx           # Toast notification system
│   │   └── Icons.tsx           # SVG icon components
│   ├── globals.css             # Complete design system
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main profile page
├── lib/
│   ├── db.ts                   # SQLite database connection & schema
│   └── types.ts                # TypeScript type definitions
└── data/                       # Auto-generated SQLite database (gitignored)
```

### API Endpoints

| Method | Endpoint              | Description                       |
|--------|----------------------|-----------------------------------|
| GET    | `/api/profile`        | Fetch profile with all related data |
| PUT    | `/api/profile`        | Update profile information        |
| POST   | `/api/skills`         | Add a new skill                   |
| DELETE | `/api/skills?id=X`    | Delete a skill                    |
| POST   | `/api/endorsements`   | Endorse a skill                   |
| POST   | `/api/social-links`   | Add a social link                 |
| DELETE | `/api/social-links?id=X` | Delete a social link           |
| POST   | `/api/experience`     | Add work experience               |
| PUT    | `/api/experience`     | Update work experience            |
| DELETE | `/api/experience?id=X` | Delete work experience           |
| GET    | `/api/settings`       | Get app settings                  |
| PUT    | `/api/settings`       | Update a setting (e.g., theme)    |

---

## Innovation Features

### 1. Skill Endorsement System

**What:** Visitors can endorse any skill on the profile by clicking the thumbs-up button, entering their name, and submitting. Each endorsement increments the count and is stored in the database. Duplicate endorsements from the same person are prevented.

**Why I chose this:**
- **Social Proof** — Endorsements add credibility to listed skills. In the real world, a skill endorsed by 24 peers carries far more weight than a self-reported proficiency bar alone.
- **Engagement** — It transforms a static profile into an interactive experience. Visitors become participants, not just viewers.
- **Data-Driven** — Endorsement counts can inform skill sorting and prominence, creating a self-curating showcase of what a developer is actually known for.

### 2. Persistent Dark Mode Toggle

**What:** A floating button toggles between light and dark themes. The preference is saved to the database via the `/api/settings` endpoint, persisting across sessions and devices.

**Why I chose this:**
- **Accessibility** — Dark mode reduces eye strain and is a genuine user need, not just an aesthetic choice.
- **Full-Stack Demonstration** — Unlike `localStorage`-only implementations, persisting theme to the database demonstrates backend integration and allows cross-device consistency.
- **Design System Showcase** — The theme system uses CSS custom properties, enabling instant theme switching with zero JavaScript DOM manipulation — showcasing thoughtful architecture.

---

## Design Decisions

- **Color System**: A curated palette anchored by `#4A7CFF` (primary blue), with complementary purple, teal, and pink accents — matching Gidy.ai's clean, professional aesthetic.
- **Typography**: Inter font at carefully chosen weights (400–800) for visual hierarchy.
- **Animations**: Subtle micro-interactions (skill bar fills, timeline fade-ins, button hover effects, pulse indicators) that make the interface feel alive without being distracting.
- **Responsive**: Fully responsive from 320px mobile to 1440px+ desktop, with breakpoints at 480px and 768px.

---

## 📄 License

MIT
