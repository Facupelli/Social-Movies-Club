import { ProfileRatingsPgRepository } from './profile-ratings.pg.repository';
import type {
  GetUserRatingMovies,
  UserMoviesServerFilters,
} from './profile-ratings.types';

export class ProfileRatingsService {
  constructor(private readonly repository = new ProfileRatingsPgRepository()) {}

  async getUserRatingMovies(
    userId: string,
    filters?: UserMoviesServerFilters,
    sessionUserId?: string
  ): Promise<GetUserRatingMovies> {
    return await this.repository.getRatingMovies(
      userId,
      filters,
      sessionUserId
    );
  }
}
