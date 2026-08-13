# SHIFT Public Policy

A USC student-led publication on technology, artificial intelligence, ethics, and public policy.

**Read → Discuss → Contribute → Act**

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- Signed HTTP-only sessions (`jose`) with server-enforced roles

## Setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

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
