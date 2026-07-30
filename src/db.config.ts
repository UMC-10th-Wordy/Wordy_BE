import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";

const dbUrl = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb(
  {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
  },
  { useTextProtocol: true },
);

export const prisma = new PrismaClient({ adapter });