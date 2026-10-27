#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  AUTH_SECRET="$(openssl rand -hex 32)"
  cat > .env <<EOF
DATABASE_URL="file:./prod.db"
AUTH_SECRET="${AUTH_SECRET}"
SITE_URL="${SITE_URL:-http://localhost:3000}"
EOF
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

npx prisma generate
npx prisma db push

npx tsx -e '
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.user.count();
await prisma.$disconnect();
if (users === 0) process.exit(2);
' || npx tsx prisma/seed.ts

exec npx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
