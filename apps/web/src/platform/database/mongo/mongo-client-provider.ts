import { type Db, MongoClient, type MongoClientOptions } from 'mongodb';

interface ConnectionConfig {
  uri: string;
  dbName: string;
  options?: MongoClientOptions;
}

class MongoDBConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;
  private config: ConnectionConfig;

  constructor() {
    this.config = {
      uri: process.env.MONGODB_URI as string,
      dbName: process.env.MONGODB_DB_NAME as string,
    };
  }

  async connect(): Promise<Db> {
    if (this.isConnected && this.client && this.db) {
      return this.db;
    }

    try {
      const { uri, dbName } = this.config;

      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      if (!dbName) {
        throw new Error('MONGODB_DB_NAME environment variable is not defined');
      }

      const options: MongoClientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45_000,
        retryWrites: true,
        retryReads: true,
      };

      this.client = new MongoClient(uri, options);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      // biome-ignore lint: reason
      console.log('✅ MongoDB connected successfully');
      return this.db;
    } catch (error) {
      // biome-ignore lint: reason
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      // biome-ignore lint: reason
      console.log('🔌 MongoDB disconnected');
    }
  }

  getDb(): Db {
    if (!(this.isConnected && this.db)) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Health check method
  async ping(): Promise<boolean> {
    try {
      if (!this.db) {
        return false;
      }
      await this.db.admin().ping();
      return true;
    } catch (error) {
      // biome-ignore lint: reason
      console.error('MongoDB ping failed:', error);
      return false;
    }
  }
}

let mongoConnection: MongoDBConnection | null = null;

export async function getDatabase(): Promise<Db> {
  if (!mongoConnection) {
    mongoConnection = new MongoDBConnection();
  }
  return await mongoConnection.connect();
}

export async function closeDatabase(): Promise<void> {
  if (mongoConnection) {
    await mongoConnection.disconnect();
    mongoConnection = null;
  }
}

export async function isDatabaseHealthy(): Promise<boolean> {
  if (!mongoConnection) {
    return false;
  }
  return await mongoConnection.ping();
}
