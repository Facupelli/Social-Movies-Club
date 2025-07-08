import type { ObjectId } from 'mongodb';

export interface User {
  email: string;
  name: string;
  password: string;
  active: boolean;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserViewModel extends User {
  id: string;
}

export interface UserDocument extends User {
  _id: ObjectId;
}
