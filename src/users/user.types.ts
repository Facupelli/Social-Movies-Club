import type { ObjectId } from 'mongodb';
import type { MovieViewModel } from '@/movies/movie.type';

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

export interface User {
  movies: MovieViewModel[];
}

export interface UserViewModel extends User {
  id: string;
}

export interface UserDocument extends User {
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
