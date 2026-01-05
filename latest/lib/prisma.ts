import { PrismaClient } from "@prisma/client";

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
