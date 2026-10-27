# SHIFT Public Policy

A USC student-led publication on technology, artificial intelligence, ethics, and public policy.

**Read → Discuss → Act**

Readers post on stories and discussions anonymously. No public account is required.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (Neon in production)
- Signed HTTP-only sessions (`jose`) for the editorial desk only

## Setup

These commands must run **inside the project folder**, not from your home directory (`~`). If you see `package.json: No such file or directory`, you are in the wrong folder.

```bash
git clone https://github.com/drameh-svg/ShiftBlog.git
cd ShiftBlog
git checkout cursor/shift-public-policy-website-9d5f

cp .env.example .env
npm install
npm run db:setup
npm run dev
```

If you already cloned the repo:

```bash
cd /path/to/ShiftBlog
git checkout cursor/shift-public-policy-website-9d5f
git pull

cp .env.example .env
npm install
npm run db:setup
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000) on your Mac.

To run the production server (same machine, all interfaces):

```bash
npm run db:setup
npm run build
npm run start:live
```

If you open a Cursor Cloud preview URL (`*.agent.cvm.dev`) and see **HTTP 502**, the app is not running in that cloud session. Refresh after the agent starts the server, or use localhost on your machine instead.

## Editorial accounts

These are seeded for the desk. Change them before any real deployment. Public sign-up is disabled.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `julia.chen@shiftpolicy.org` | `ShiftAdmin2026!` |
| Editor | `marcus.owens@shiftpolicy.org` | `ShiftEditor2026!` |

Editorial authorization is enforced in `src/proxy.ts` and again in the editorial layout and server actions against the database role.

## Routes

- `/` homepage (logo splash, then landing)
- `/read` article index (Campus, Latest news, Op-eds)
- `/stories/[slug]` individual articles, with anonymous notes
- `/discuss` anonymous discussion threads
- `/involve` opportunities
- `/editor` private SHIFT Editorial desk

## Publishing

Articles are added by editors for now. Sign in at `/sign-in`, open **+ New Story**, write, save a draft, preview, then publish. A self-serve desk upload process is planned. Admins can delete stories and manage team roles.
