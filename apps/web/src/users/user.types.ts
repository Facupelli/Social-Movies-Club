import type { ObjectId } from 'mongodb';

export interface AuthUser {
  email: string;
  name: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserViewModel extends AuthUser {
  id: string;
}

export interface AuthUserDocument extends AuthUser {
  _id: ObjectId;
}

export interface UserRelationship {
  followerId: ObjectId;
  followedId: ObjectId;
  createdAt: Date;
}

export interface UserRelationshipDocument extends UserRelationship {
  _id: ObjectId;
}
