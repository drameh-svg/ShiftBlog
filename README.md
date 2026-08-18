# SHIFT Public Policy

A USC student-led publication on technology, artificial intelligence, ethics, and public policy.

**Read → Discuss → Contribute → Act**

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- Signed HTTP-only sessions (`jose`) with server-enforced roles

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

If you open a Cursor Cloud preview URL (`*.agent.cvm.dev`) and see **HTTP 502**, the app is not running in that cloud session. Refresh after the agent starts `npm run dev`, or use localhost on your machine instead.

## Demo accounts

These are seeded for local review. Change them before any real deployment.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `julia.chen@shiftpolicy.org` | `ShiftAdmin2026!` |
| Editor | `marcus.owens@shiftpolicy.org` | `ShiftEditor2026!` |
| Public student | `sam.okonkwo@usc.edu` | `StudentDemo2026!` |

A public account can read, comment, discuss, and submit. It **cannot** open `/editor`. Editorial authorization is enforced in `src/proxy.ts` and again in the editorial layout and server actions against the database role.

## Routes

- `/` homepage
- `/stories` and `/stories/[slug]`
- `/discuss` and debate threads
- `/involve` opportunities
- `/submit` ideas and writing
- `/editor` private SHIFT Editorial desk

## Publishing

Editors sign in, choose **+ New Story**, write, save a draft, preview, then publish. Admins can delete stories and manage team roles.
