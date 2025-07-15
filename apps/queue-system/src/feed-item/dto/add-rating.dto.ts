import { IsString, IsNotEmpty } from 'class-validator';

export class AddRatingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  ratingId: string;
}
