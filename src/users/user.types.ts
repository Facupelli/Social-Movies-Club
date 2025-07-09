import type { ObjectId } from 'mongodb';
import type { MovieViewModel } from '@/movies/movie.type';

export interface User {
  email: string;
  name: string;
  emailVerified: boolean;
  image: string;
  movies: MovieViewModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserViewModel extends User {
  id: string;
}

export interface UserDocument extends User {
  _id: ObjectId;
}
