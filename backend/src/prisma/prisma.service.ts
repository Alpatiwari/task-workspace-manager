import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // If TURSO_DATABASE_URL is set, connect through the libSQL adapter (Turso).
    // Otherwise fall back to plain local SQLite via DATABASE_URL (local dev).
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    if (tursoUrl) {
      const libsql = createClient({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      super({ adapter: new PrismaLibSQL(libsql) });
    } else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}