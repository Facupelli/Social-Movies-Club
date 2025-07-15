import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database.constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  async onModuleInit() {
    try {
      await this.healthCheck();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  getDatabase(): NodePgDatabase {
    return this.db;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db.execute('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }
}
