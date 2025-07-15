import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from './database.constants';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        const db = drizzle(pool);
        return db;
      },
    },
    DatabaseService,
  ],
  exports: [DatabaseService, DATABASE_CONNECTION],
})
export class DrizzleModule {}
