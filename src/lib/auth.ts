import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { getDatabase } from '../infra/mongo/mongo-client-provider';

const db = await getDatabase();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
