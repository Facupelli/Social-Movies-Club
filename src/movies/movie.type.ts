import type { ObjectId } from 'mongodb';

export interface Movie {
  name: string;
  password: string;
  active: boolean;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieViewModel extends Movie {
  id: string;
}

export interface MovieDocument extends Movie {
  _id: ObjectId;
}
