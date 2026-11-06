import { IsBoolean } from 'class-validator';

export class SetActiveUser {
  @IsBoolean()
  is_active!: boolean;
}
