import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipient: string;

  @IsString()
  userId: string;

  @IsString()
  action: string;

  @IsOptional()
  note: { username: string, title: string };
}
