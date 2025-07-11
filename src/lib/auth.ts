import { betterAuth } from 'better-auth';
// import { mongodbAdapter } from 'better-auth/adapters/mongodb';
// import { getDatabase } from '../infra/mongo/mongo-client-provider';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/infra/neon/db.neon';
import * as schema from '@/infra/neon/schema';

// const db = await getDatabase();

export const auth = betterAuth({
  // database: mongodbAdapter(db),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
